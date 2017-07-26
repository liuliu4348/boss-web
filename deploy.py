# -*- coding: UTF-8 -*-
import web
import utils
import json

urls = (
    '/(.*)', 'hello', #匹配任意字符
)
render =web.template.render('templates')
app = web.application(urls, globals())

bossmon = ''
bossds = ''
bosscli = ''
class hello:
    def GET(self, name):
        data=web.input()
        if data:
            historyInfo = utils.readLog()
            return json.dumps(historyInfo)
        else:
            return render.table()
    def POST(self,info):
        data=web.input()
        rpmlist=[]
        ip=data["ip"]
        password=data["password"]
        if data["bossmon"]=="1":
            rpmlist.append('monitor')
        if data["bossds"] == "1":
            rpmlist.append('dataserver')
        if data["bossclient"]=="1":
            rpmlist.append('client')
        status,output=utils.rpminstall(ip,password,rpmlist)
        s=0
        for x in status:
            if x != 0:
                s=1
                break
        if s==0:
            utils.writeLog(ip,rpmlist)
        ret = {}
        ret['s']=s
        ret['output']=output
        return json.dumps(ret)


if __name__ == "__main__":
    app.run()