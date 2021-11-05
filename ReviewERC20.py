import os, subprocess
import sys

# Slither 결과 파일 있는 것으로 가정(SlitherResult.txt)
# 솔리디티 컴파일 에러가 나는 경우 처리 안함
# private 자료는 수작업 변경 필요 
# modifier 도 수작업 변경 필요
# ===================================
# Step1: API prototype compatibility
# ===================================

def check(line):
    if (line[1] == '✓'):
        return True
    else:
        return False

def printTF(truefalse):
    if (truefalse == True):
        return "OK"
    else:
        return "API incompatible"

def chk_slither_report():
    print("[Result of API prototype compatibility of ERC-20]")
    with open("SlitherResult.txt", encoding='utf-8') as file_target:
        for line in file_target:
            if (line.find('transfer (address, uint256) -> (bool)') != -1):
                transfer = check(line)
                print('transfer: ' + printTF(transfer))
            elif (line.find('approve (address, uint256) -> (bool)') != -1):
                approve = check(line)
                print('approve: ' + printTF(approve))
            elif (line.find('transferFrom (address, address, uint256) -> (bool)') != -1):
                transferFrom = check(line)
                print('transferFrom: ' + printTF(transferFrom))
            elif (line.find('allowance (address, address) -> (uint256)') != -1):
                allowance = check(line)
                print('allowance: ' + printTF(allowance))
            elif (line.find('balanceOf (address) -> (uint256)') != -1):
                balanceOf = check(line)
                print('balanceOf: ' + printTF(balanceOf))
            elif (line.find('totalSupply () -> (uint256)') != -1):
                totalSupply = check(line)
                print('totalSupply: ' + printTF(totalSupply))
    file_target.close()

# ==================================
# Step2: API behavior compatibility
# ==================================

def replace_version():
    sol_file = token_dir+"\\contracts\\{}.sol".format(file_path)
    js_file = token_dir+"\\truffle-config.js"
    with open(sol_file, 'r') as file_target:
        for line in file_target:
            if (line.startswith('pragma')):
                version_line = line
                break
    file_target.close()
    pos = version_line.find('solidity')
    tmp = version_line[pos + 8:]
    tmp = tmp.lstrip()
    pos = tmp.find(';')
    version = tmp[:pos]

    with open(js_file, 'r+') as file:
        lines = []
        for line in file:
            if (line.startswith('version', line.find('version'))):
                pos = line.find('version')
                new_line = line[:pos + 7] + ': "' + version + '",\n'
                # print(new_line)
                p = new_line.find('//')
                new_line = new_line[:p] + new_line[p+2:]
                # print(new_line)
                lines = lines + [new_line]
            else:
                lines = lines + [line]
        file.seek(0)
        file.writelines(lines)
        file.close()

def run_functional_spec():
    output = None
    try:
        output = subprocess.check_output("mkdir {}".format(file_path), shell=True)
    except subprocess.CalledProcessError as e:
        output = e.output

    dir = "\\" + file_path
    os.chdir(current_dir+dir)

    output = None
    try:
        output = subprocess.check_output("truffle init", shell=True)
    except subprocess.CalledProcessError as e:
        output = e.output

    output = None
    try:
        output = subprocess.check_output("del contracts\\Migrations.sol", shell=True)
    except subprocess.CalledProcessError as e:
        output = e.output

    output = subprocess.check_output("mkdir build", shell=True)
    output = subprocess.check_output("mkdir build\\contracts", shell=True)

    output = subprocess.check_output("copy ..\\common\\build\\contracts\\ERC20Test.json build\\contracts", shell=True)
    output = subprocess.check_output("copy ..\\common\\build\\contracts\\ERC20TokenInterface.json  build\\contracts", shell=True)
    output = subprocess.check_output("copy ..\\common\\build\\contracts\\Migrations.json build\\contracts", shell=True)
    output = subprocess.check_output("copy ..\\common\\migrations\\2_deploy_contracts.js migrations", shell=True)

    output = subprocess.check_output("npm install js-sha3", shell=True)

    output = subprocess.check_output("copy ..\\target\\*.sol contracts", shell=True)
    output = subprocess.check_output("copy ..\\common\\test\erc20test.js 	test", shell=True)
    output = subprocess.check_output("copy ..\\target\\initialize.js test", shell=True)

    replace_version()
    # output = subprocess.check_output("del truffle-config.js", shell=True)
    # output = subprocess.check_output("copy ..\\target\\truffle-config.js ", shell=True)

    output = None
    try:
        output = subprocess.check_output("truffle test --show-events > output.txt", shell=True)
    except subprocess.CalledProcessError as e:
        output = e.output

def chk_fail_fs_name(line):
    string_to_search = ["TS", "BA", "TR", "TF", "AP", "AL"]
    for x in string_to_search:
        if (line.find(x) != -1):
            tmp = line[line.find(x):]
            fs_name = tmp[:tmp.find('.')]
            return True, fs_name
    return False, ''

# functional specification names
fs_name_list = [ "TS1", "BA1", "BA2", "TR1", "TR2", "TR3", "TR4", "TR5",
            "TF1", "TF2", "TF3", "TF4", "TF5", "TF6", "AP1", "AP2", "AP3", "AL1", "AL2" ]

def fs_result_str(result_str,fs):
    tmp = ""
    for i in range(len(fs_name_list)):
        if fs_name_list[i] == fs:
            tmp = result_str[:i] + 'f' + result_str[i+1:]
    return tmp

def chk_functional_spec():
    result_str = "ppppppppppppppppppp"

    fail_fs_set = []
    find_faling = False
    with open(token_dir+"\\output.txt", encoding='utf-8') as file_output:
        for line in file_output:
            if (line.find("failing") != -1):
                failing_line = line
                pos = failing_line.find("failing")
                tmp = failing_line[:pos-1]
                strs = tmp.strip()
                tmp = strs[-1]
                find_faling = True
                continue
            elif (find_faling == True):
                result, fs = chk_fail_fs_name(line)
                if (result == True):
                    fail_fs_set.append(fs)
                    tmp_str = fs_result_str(result_str,fs)
                    result_str = str(tmp_str)
                    # print("2" + result_str)
        if (len(fail_fs_set) != int(tmp)):
            print("Check Report!!")
    file_output.close()
    # print("1" + result_str)
    return fail_fs_set, result_str

check_list_dic = {
    "TR2": ["TR2 Functional Specification fail.",
            "    TR2: transfer(): sender.balance >= value & to.balance+value <= MAX & value = 0",
            "     1) Check if it reverts without processing 0 value ",
            "     2) Check if it returns false without processing 0 value",
            "     3) Check if a Transfer event is fired"],

    "TR3": ["TR3 Functional Specification fail.",
            "    TR3: transfer(): sender.balance >= value & to.balance+value > MAX",
            "     1) Check if overflow is not handled",
            "     2) Check for code errors even though overflow is handled",
            "     3) Check if it reverts(False return is recommended instead of revert)"],

    "TR4": ["TR4 Functional Specification fail.",
            "    TR4: transfer(): sender.balance < value",
            "     1) Check if it returns false (It should throw)"],

    "TR5": ["TR5 Functional Specification fail.",
            "    TR5: transfer(): invalid sender",
            "     1) Check if it returns false (It should throw)"],

    "TF2": ["TF2 Functional Specification fail.",
            "    TF2: transferFrom(): sender.balance >= value & to.balance+value <= MAX & ",
            "                         caller\'s allowance by from >= value & value = 0",
            "     1) Check if it reverts without processing 0 value ",
            "     2) Check if it returns false without processing 0 value",
            "     3) Check if a Transfer event is fired"],

    "TF3": ["TF3 Functional Specification fail.",
            "    TF3: transferFrom(): sender.balance >= value & to.balance+value <= MAX & ",
            "                         caller\'s allowance by from < value",
            "     1) Check if it returns false (It should throw) "],

    "TF4": ["TF4 Functional Specification fail.",
            "    TF4: transferFrom(): sender.balance >= value & to.balance+value > MAX",
            "     1) Check if overflow is not handled",
            "     2) Check for code errors even though overflow is handled",
            "     3) Check if it reverts(False return is recommended instead of revert)"],

    "TF5": ["TF5 Functional Specification fail.",
            "    TF5: transferFrom(): from.balance < value",
            "     1) Check if it returns false (It should throw)"],

    "TF6": ["TF6 Functional Specification fail.",
            "    TF6: transferFrom(): invalid from",
            "     1) Check if it returns false (It should throw)"],

    "AP1": ["AP1 Functional Specification fail.",
            "    AP1: approve(): caller balance >= value",
            "     1) Check if a Approval event is fired"],

    "AP2": ["AP2 Functional Specification fail.",
            "    AP2: approve(): caller balance < value",
            "     1) Check if a Approval event is fired",
            "     2) Check if it reverts"],

    "AP3": ["AP3 Functional Specification fail.",
            "    AP3: approve(): invalid caller",
            "     1) Check if a Approval event is fired",
            "     2) Check if it reverts"]
}

def show_checklist(fs_name):
    value = check_list_dic.get(fs_name)
    if value == None:
        print("{} Functional Specification fail.".format(fs_name))
        print("    Checklist not exist.")
    else:
        for str in check_list_dic[fs_name]:
            print(str)

def print_result_fs(fail_fs_set):
    print("[Result of Behavioral compatibility of ERC-20]")
    print("Pass: " + str(19 - len(fail_fs_set)))
    print("Fail: " + str(len(fail_fs_set)))
    for fs in fail_fs_set:
        show_checklist(fs)
    print()

# ===================================================
# Step3: Comparison with the existing top-100 tokens
# ===================================================

# Class Behavior Result in terms of functional specification
classlist = [
    "pppppfpppppfppppppp",
    "ppppffffpfffffppppp",
    "pppppfffppffffppppp",
    "ppppppffppfpffppppp",
    "pppfffffpfpfppfffpp",
    "pppffffffffffffffpp",
    "ppppffpppfpfppppppp",
    "pppppfffppffffppppp",
    "pppppfpppppfpppffpp",
    "ppppfpffpffpffppppp",
    "ppppfpffpfffffppppp",
    "ppppffpppppfpppffpp",
    "ppppffffpfffffppppp",
    "ppppfffffffffffffff"
]

# Class token list
tokens = [
    "LINK,LEO,USD,MKR,HEDG",
    "VEN,BAT,SNT,BTM,NULS,HPT,RPL",
    "CEL,AION,POWR,RCN,EURS,INS,FUN",
    "HT,ZRX,IOST",
    "BNB,INO,ERC20",
    "Tether,OMG,KCS",
    "Theta,LEND,ANT",
    "AION,FUN",
    "VEST",
    "BRC",
    "DIVX",
    "WIC",
    "SNT",
    "GNT"
]
def compare_str(std,target):
    diff_fs = []
    for i in range(len(std)):
        if std[i] != target[i]:
            diff_fs.append(i)
    return diff_fs

def chk_diff_defacto(rstr):
    diff_fs_idx = compare_str(classlist[0],rstr)
    print("[Behavioral differences from de facto standard]")
    if len(diff_fs_idx) == 0:
        print(": None")
    else:
        for i in range(len(diff_fs_idx)):
            print(fs_name_list[diff_fs_idx[i]])
    print()
    return

def show_similar_tokens(rstr):
    cmp_class_dic = {}
    for i in range(len(classlist)):
        diff_fs_idx = compare_str(classlist[i], rstr)
        cmp_class_dic[i+1] = len(diff_fs_idx)
    sort_dic = sorted(cmp_class_dic.items(), key=lambda item: item[1])

    print("[A list of names of behaviorally similar tokens]")
    # print(type(sort_dic[0]))
    idx, value = sort_dic[0]
    if value == 0:
        print("Tokens of Same behavior: " + tokens[idx-1])
    else:
        print("Tokens of Similar behavior: " + tokens[idx - 1])
    return

# ================================
# main
# ================================
file_path = sys.argv[1]
current_dir = os.getcwd()
token_dir = current_dir + "\\" + file_path

# print(file_path)
# Step 1
chk_slither_report()

# Step 2
run_functional_spec()
fail_fs_set, fs_str = chk_functional_spec()
print_result_fs(fail_fs_set)
# print(fs_str)

# Step 3
chk_diff_defacto(fs_str)
show_similar_tokens(fs_str)








