# -*- coding: UTF-8 -*-
import commands
import settings
import os
import logging
import sys
import re

reload(sys)
sys.setdefaultencoding('utf8') #文件开头是编码指示，该处是解码指示

#功能：从路径中取得三个rpm包的包名
def getpkgname(dirpath):
    ret = []
    for root,dir,files in os.walk(dirpath):
        for filespath in files:
            #ret.append(os.path.join(root,filespath)) #会给出全路径
            ret.append(filespath) #给出所有文件的文件名
    for each in ret:
        if 'boss_ds' in each:
            bossdsname = each
        elif 'boss_mon' in each:
            bossmonname = each
        elif 'boss_client'in each:
            bossclientname = each
    return bossdsname ,bossmonname,bossclientname

#功能：安装rpm包
#输入参数 ip：ip地址
#         sshpassword：对应节点的ssh密码
#         list：需要安装的rpm包
#输出参数 status:安装是否正确的标志位，正确为0
#         output:安装错误时候的信息
def rpminstall(ip,sshpassword,list):
    bossdsname, bossmonname, bossclientname = getpkgname(settings.RPM_DIR)
    status =[]
    output = []
    for rpm in list:
        if rpm == 'dataserver':
            path = settings.RPM_DIR + bossdsname
            remotepath=settings.REMOTE_RPM_DIR+bossdsname
        elif rpm =='monitor':
            path = settings.RPM_DIR + bossmonname
            remotepath = settings.REMOTE_RPM_DIR + bossmonname
        elif rpm == 'client':
            path = settings.RPM_DIR + bossclientname
            remotepath = settings.REMOTE_RPM_DIR + bossclientname
        #拷贝rpm包
        s1, o1 = commands.getstatusoutput("sshpass -p %s scp -o StrictHostKeyChecking=no %s %s@%s:%s" % (sshpassword, path, settings.USER, ip, settings.REMOTE_RPM_DIR))
        status.append(s1)
        if s1 != 0:
            output.append(o1)
            continue
        # 安装rpm包
        s2, o2 = commands.getstatusoutput("sshpass -p %s ssh %s@%s -o StrictHostKeyChecking=no rpm -ivh --force %s" % (sshpassword, settings.USER, ip,remotepath ))
        status.append(s2)
        if s2 != 0:
            output.append(o2)
        # 删除rpm包
        commands.getstatusoutput("sshpass -p %s ssh %s@%s -o StrictHostKeyChecking=no rm -rf %s" % (sshpassword, settings.USER, ip, remotepath))
    return status,output


#功能：写日志
#输入参数 ip：写入日志的ip地址
#        rpmlist：每个节点对应的安装成功的rpm包
def writeLog(ip,rpmlist):
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(message)s',
                        datefmt='%a, %d %b %Y %H:%M:%S',
                        filename='boss_deploy.log',
                        filemode='a')
    if len(rpmlist)==1:
        logging.info("节点%s完成部署%s" % (ip,rpmlist[0]))
    elif len(rpmlist)==2:
        logging.info("节点%s完成部署%s,%s" % (ip, rpmlist[0],rpmlist[1]))
    elif len(rpmlist)==3:
        logging.info("节点%s完成部署%s,%s,%s" % (ip, rpmlist[0],rpmlist[1],rpmlist[2]))


#功能：读日志
#输出参数 arr：每一个节点的已经安装的rpm包读出
# arr格式：{'192.168.30.202': {'dataserver': 0, 'monitor': 1, 'client': 1}, '192.168.30.201': {'dataserver': 1, 'monitor': 1, 'client': 1}}
def readLog():
    arr = {}
    if not os.path.exists("boss_deploy.log"):
        tmp=open("boss_deploy.log","w") #创建文件
        tmp.close()
    f = open("boss_deploy.log", "r")
    lines = f.readlines()
    ipaddress = re.compile(r'(((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?))')
    bossmonPatt = re.compile(r'monitor')
    bossdsPatt = re.compile(r'dataserver')
    bosscliPatt = re.compile(r'client')
    for line in lines:
        searchIp = ipaddress.search(line)
        searchBossmon = bossmonPatt.search(line)
        searchBossds = bossdsPatt.search(line)
        searchBosscli = bosscliPatt.search(line)
        if searchIp:
            ip = searchIp.group()
            # print ip
            if (arr.has_key(ip)):
                if searchBossmon:
                    arr[ip]["monitor"] = "已安装"
                if searchBossds:
                    arr[ip]["dataserver"] = "已安装"
                if searchBosscli:
                    arr[ip]["client"] = "已安装"
            else:
                info = {}
                info.setdefault("monitor", "未安装")
                info.setdefault("dataserver", "未安装")
                info.setdefault("client", "未安装")
                if searchBossmon:
                    info["monitor"] = "已安装"
                if searchBossds:
                    info["dataserver"] = "已安装"
                if searchBosscli:
                    info["client"] = "已安装"
                arr[ip] = info

    f.close()
    return arr




