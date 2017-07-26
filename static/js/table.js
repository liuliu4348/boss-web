/**
 * Created by liuliu on 2017/5/26.
 */
$(document).ready(function () {
        $("#addbtn").click(function () {
            $("#tb").append("<tr class='tr'finish='no'> "
                +"<td><label><input class='form-control' type='text'></label></td>"
                +"<td><label><input class='form-control' type='password'></label></td>"
                +"<td><label><input class='bossck' type='checkbox'>部署</label></td>"
                +"<td><label><input class='bossck' type='checkbox'>部署</label></td>"
                +"<td><label><input class='bossclick' type='checkbox'>部署</label></td>"
                +"<td><input type='button' class='btn btn-info delOneRow' value='删除'></td>"
                +"</tr>");
        });
        //在父元素上绑定监听事件
        $("#tb").on("click",".delOneRow",function () {
            // if(confirm("确认删除？")){
            //     $(this).parent().parent().remove();
            // }
            var delBtn=$(this);
            swal({
                title:"确认删除？",
                type:"warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "删除",
                cancelButtonText: "取消",
                closeOnConfirm: true
            },
            function (isConfirm) {
                if(isConfirm){
                    delBtn.parent().parent().remove();
                }
            });
        });


         $("#tb").on("click",".bossck",function () {
            if($(this).prop('checked')==true){
                $(this).parents("tr").find("input:eq(4)").prop("checked",true); //因为checked是checkbox的固有属性使用attr是直接删除设置属性可能会导致浏览器产生错误导致js无法继续执行
            }
        });

         $("#tb").on("click",".bossclick",function () {
             if ($(this).parents("tr").find("input:eq(2)").prop("checked") || $(this).parents("div").find("input:eq(3)").prop("checked")) {
                 $(this).prop("checked",true);
             }
         });

         $("#checkdiv").on("click",".bossck",function () {
            if($(this).prop('checked')==true){
                $(this).parents("#checkdiv").find("input:eq(2)").prop("checked",true); //因为checked是checkbox的固有属性使用attr是直接删除设置属性可能会导致浏览器产生错误导致js无法继续执行
            }
        });

         $("#checkdiv").on("click",".bossclick",function () {
             if ($(this).parents("#checkdiv").find("input:eq(0)").prop("checked") || $(this).parents("#checkdiv").find("input:eq(1)").prop("checked")) {
                 $(this).prop("checked",true);
             }
         });

        //清空进度条状态
        function clearProgressBar(length) {
            $("#progressdiv2").text("0/"+length);
            $("#progressdiv2").css("width","0%");
        }

        //设置进度条状态
        function setProgressBar(isSuccess,length) {
            $("#progressdiv2").text(isSuccess+"/"+length);
             $("#progressdiv2").css("width",isSuccess*100/length+"%");
        }

        $("#cfmbtn").click(function () {
            var flag1 = true;
            var flag2 = true;
            var bossMonCount = 0;
            var length=$("#div3 table tbody tr[finish = 'no']").length; //计算未完成的table表的行数
            if(length==0){
                $("#div0").hide();
                //alert("部署已完成");
                swal("部署已完成");
                return;
            }
            //console.log(length);
            swal({
                title:"确认部署？",
                type:"info",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                closeOnConfirm: false
            },
            function (isConfirm) {
                if(isConfirm){
                    $("#div0").show();
                    $("#tb tr").each(function(){
                        if($(this).attr("finish")=="no"){
                            $(this).find("input[type=text]").each(function () {
                            if($(this).val().trim()==""){
                                flag1 = false;
                            }
                            });
                            $(this).find("input[type=password]").each(function () {
                            if($(this).val().trim()==""){
                                flag1 = false;
                            }
                            });
                            // $(this).find("input[type=checkbox]").each(function () {
                            //     flag2 = flag2 || $(this).prop('checked');
                            // });

                            // if($(this).find("input:eq(0)").val()=="" || $(this).find("input:eq(1)").val()==""){
                            //     flag1 = false;
                            // }
                            if((!($(this).find("input:eq(2)").prop('checked')) && !($(this).find("input:eq(3)").prop('checked')) && !($(this).find("input:eq(4)").prop('checked')))){
                                flag2 = false;
                            }
                            if($(this).find("input:eq(2)").prop('checked')){
                                bossMonCount++;
                            }
                        }
                    });

                    // if(bossMonCount != 2){
                    //     alert("请部署两个boss_mon节点，一个作为主monitor，一个作为备monitor！");
                    //     $("#div0").hide();
                    //     return ;
                    // }

                    if(flag1 & flag2) {
                        swal.close();
                        $("p").text("");//将原先报警信息清除
                        clearProgressBar(length);
                        $("#progressdiv").show();
                        var store = $("#div0");
                        store.attr("count",0);
                        store.attr("success",0); //部署成功的节点数量
                        store.attr("fail",0); //部署失败的节点数量
                        $("#tb tr").each(function () {
                            //console.log($(this).attr("finish"));
                            if($(this).attr("finish")=="no"){
                                $(this).removeClass("danger"); //将原来表格行的效果清除
                                $(this).removeClass("info");
                                var trinfo = {};
                                trinfo["ip"]=$(this).find("input:eq(0)").val().trim();
                                trinfo["password"]=$(this).find("input:eq(1)").val().trim();
                                if($(this).find("input:eq(2)").prop('checked')){
                                    trinfo["bossmon"]=1;
                                }else{
                                    trinfo["bossmon"]=0;
                                }
                                if($(this).find("input:eq(3)").prop('checked')){
                                    trinfo["bossds"]=1;
                                }else{
                                    trinfo["bossds"]=0;
                                }
                                if($(this).find("input:eq(4)").prop('checked')){
                                    trinfo["bossclient"]=1;
                                }else{
                                    trinfo["bossclient"]=0;
                                }
                                var tmp = $(this); //将行保存在变量中，回调函数不能直接调用行
                                var url = window.location.href;
                                $.post(url,trinfo,function (data) {
                                    var result=$.parseJSON(data);
                                    if(result.s==0) {
                                        tmp.addClass("info");
                                        tmp.attr("finish","yes");
                                        //console.log(tmp.attr("finish"));
                                        var count = parseInt(store.attr("count"))+1;
                                        store.attr("count",count);
                                        var success = parseInt(store.attr("success"))+1;
                                        store.attr("success",success);
                                        setProgressBar(success,length);
                                        //console.log(parseInt(store.attr("success")));
                                        if(parseInt(store.attr("count"))==length) {
                                            $("#div0").hide();
                                            // setTimeout(function () {
                                            //     $("#progressdiv").hide();
                                            // },500);
                                            if(parseInt(store.attr("success"))==length) {
                                                setTimeout(function () {
                                                    //alert("部署成功！");
                                                    swal("部署成功！","您已成功完成安装！","success");
                                                    $("#progressdiv").hide();
                                                    $("#tb").html("");
                                                },500); //sleep 1 s
                                            }else{
                                                setTimeout(function () {
                                                    //alert("部署失败："+store.attr("success")+"个节点成功，"+store.attr("fail")+"个节点失败！");
                                                    swal("部署失败！",store.attr("success")+"个节点成功，"+store.attr("fail")+"个节点失败！","error");
                                                    $("#progressdiv").hide();
                                                    //将成功的行函数删除
                                                    $("#tb tr").each(function () {
                                                        if($(this).hasClass("info")){
                                                            $(this).remove();
                                                        }
                                                    });
                                                },500);
                                            }
                                        }
                                    }else if(result.s==1){
                                        tmp.addClass("danger");
                                        var count = parseInt(store.attr("count"))+1;
                                        store.attr("count",count);
                                        var fail = parseInt(store.attr("fail"))+1;
                                        store.attr("fail",fail);
                                        //console.log(parseInt(store.attr("count")));
                                        if(parseInt(store.attr("count"))==length) {
                                            $("#div0").hide();
                                            setTimeout(function () {
                                                //alert("部署失败："+store.attr("success")+"个节点成功，"+store.attr("fail")+"个节点失败！");
                                                swal("部署失败！",store.attr("success")+"个节点成功，"+store.attr("fail")+"个节点失败！","error");
                                                $("#progressdiv").hide();
                                                //将成功的行函数删除
                                                $("#tb tr").each(function () {
                                                    if($(this).hasClass("info")){
                                                        $(this).remove();
                                                    }
                                                });
                                            },500);
                                        }
                                        $("p").text(result.output);
                                    }
                                 });
                                }
                            });
                    }else if(!flag1){
                        $("#div0").hide();
                        //alert('节点ip和ssh密码不能为空！');
                        swal({
                            title:"节点ip和ssh密码不能为空！",
                            type:"info",
                            showCancelButton: false,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "确认",
                            closeOnConfirm: true
                        });
                    }else if(!flag2){
                        $("#div0").hide();
                        //alert('请为节点选择部署类型！');
                        swal({
                            title:"请为节点选择部署类型！",
                            type:"info",
                            showCancelButton: false,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "确认",
                            closeOnConfirm: true
                        });
                    }
                }
            });
            // if(confirm("确认部署？")){
            //
            // }
        });

        var SLIDE_MAJOR_UNIT_MAX=1000

        // --------------------------------
        // 替换字符串中 {placeholder} 或者 {0}, {1} 等模式部分为参数中传入的字符串
        // 使用方法:
        //       formatString('I can speak {language} since I was {age}', {language: 'Javascript', age: 10})
        //       formatString('I can speak {0} since I was {1}', 'Javascript', 10)
        // 输出都为:
        //       I can speak Javascript since I was 10
        //
        // @param str 带有 placeholder 的字符串
        // @param replacements 用来替换 placeholder 的 JSON 对象或者数组
        // --------------------------------

        var formatString = function (str, replacements) {
            replacements = (typeof replacements === 'object') ? replacements : Array.prototype.slice.call(arguments, 1);
            return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function(m, n) {
                if (m == '{{') { return '{'; }
                if (m == '}}') { return '}'; }
                return replacements[n];
            });
        };

        // --------------------------------
        // 检查字符串是否为IPv4地址
        // Params: str: 待检查的字符串
        // Return: bool
        // --------------------------------
        function isIpv4(str)
        {
            var _str = str == null ? "" : str.trim();
            if(_str == "")
                return false;

            var regIpv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
            return regIpv4.test(_str);
        }

        // --------------------------------
        // 增加一个新节点编辑行
        // Params: ip:          节点前端IP地址初始值
        //         nodePwd:     节点ssh密码初始值
        //         bossmonChk   boss_mon是否选择被安装
        //         bossdsChk    boss_ds是否选择被安装
        //         bosscliChk   boss_client是否选择被安装
        // Return: 成功返回单元引用，失败返回null
        // --------------------------------
        function addNodeTr(ip,nodePwd,bossmonChk,bossdsChk,bosscliChk) {
            var _nodeIp = ip != null ? ip.trim() : "";
            var _nodePwd = nodePwd != null ? nodePwd.trim() : "";
            var tr = formatString("<tr class='tr'finish='no'> "
                +"<td><label><input class='form-control' type='text' value={ip}></label></td>"
                +"<td><label><input class='form-control' type='password' value={pwd}></label></td>"
                +"<td><label><input class='bossck' type='checkbox' {check1}>部署</label></td>"
                +"<td><label><input class='bossck' type='checkbox' {check2}>部署</label></td>"
                +"<td><label><input class='bossclick' type='checkbox' {check3}>部署</label></td>"
                +"<td><input type='button' class='btn btn-info delOneRow' value='删除'></td>"
                +"</tr>",{ip:_nodeIp,pwd:_nodePwd,check1:bossmonChk ? "checked='checked'":"",check2:bossdsChk ? "checked='checked'":"",check3:bosscliChk ? "checked='checked'":""});
            $("#tb").append(tr);
        }


        // --------------------------------
        // 提取模板单元中的常量替换表达式
        // Params: tplExp: 模板表达式
        //         regExp: 正则表达式，若不指定则使用默认值
        // Return: 替换表达式
        // NOTE:   只返回匹配到的第一个结果或空字符串
        // --------------------------------
        var getTplExpression = function(tplExp, regExp){
            var _tplExp = tplExp != null ? tplExp.trim() : "";
            var _regExp = regExp != null ? regExp : /(\[\@[^\]]+\])/; //第三个符号不为"]"
            if(_tplExp == "" || _regExp == null)
                return "";
            var retExp = _regExp.exec(_tplExp);
            return retExp != null && retExp.length > 0 ? retExp[0] : "";
        };

        // --------------------------------
        // 解析模板单元中的常量替换表达式 [@1,10-20,50],
        // NOTE: [&var]形式的变量替换表达式由具体的面板解析
        // Params: expConstant: 常量替换表达式
        //         maxArrayLen: 返回数组的最大长度
        // Return: 排序后的整型数组或空数组
        // --------------------------------
        var parseTplConstant = function(expConstant, maxArrayLen)
        {
            var _exp = expConstant != null ? expConstant.trim() : "";
            if(_exp.length < 4 || (maxArrayLen != null && maxArrayLen <= 0))
                return [];

            _exp = _exp.substr(0, _exp.length - 1);
            _exp = _exp.substr(2).replace(/\s/g, "");
            var arr = _exp.split(",");
            if(arr.length == 0)
                return [];
            var rsltMap = {};
            for(var i = 0; i < arr.length; i++)
            {
                var range = arr[i].split("-");
                if(range.length < 1 || range.length > 2)
                    return [];
                else
                {
                    var rangeStart = range[0];
                    var rangeEnd = range.length == 2 ? range[1] : rangeStart;
                    if(i == 0)
                        var numeric = $.isNumeric(rangeStart) && $.isNumeric(rangeEnd);
                    if(numeric)
                    {
                        rangeStartInt = parseInt(rangeStart);
                        rangeEndInt = parseInt(rangeEnd);
                        if(isNaN(rangeStart) || isNaN(rangeEnd) || rangeStart < 0 || rangeEnd < 0)
                            return [];
                    }
                    if(rangeEndInt < rangeStartInt)
                    {
                        var tmp = rangeEndInt;
                        rangeEndInt = rangeStartInt;
                        rangeStartInt = tmp;
                    }
                    var intToString = {0:"00",1:"01",2:"02",3:"03",4:"04",5:"05",6:"06",7:"07",8:"08",9:"09"};
                    for(var j = rangeStartInt; j <= rangeEndInt; j++) {
                        if(intToString[rangeStartInt]==rangeStart){
                            if(j>0 && j<10){
                                rsltMap[intToString[j]]=true;
                            }else{
                                rsltMap[j] = true;
                            }
                        }else{
                            rsltMap[j] = true;
                        }
                    }
                }
            }
            // NOTE: rsltMap的key全为整型数，已自动升序排列
            var rsltArr = [];
            var rsltNum = 0;
            for(var key in rsltMap)
            {
                if(maxArrayLen != null && rsltNum == maxArrayLen)
                    break;
                var rslt = key
                rsltArr.push(rslt);
                rsltNum++;
            }
            return rsltArr;
        };

        $("#genNodeUnits").click(function () {
            var nodeIp = $("#formGroupInput1").val();
            var nodePwd = $("#formGroupInput2").val();
            var bossmonChk = $("#bossmonCheckbox").prop('checked');
            var bossdsChk = $("#bossdsCheckbox").prop('checked');
            var bossmcliChk = $("#bossclientCheckbox").prop('checked');
            nodeIp = nodeIp !=null ? nodeIp.trim():"";
            nodePwd = nodePwd !=null ? nodePwd.trim():"";
            if(nodeIp==""){
                //alert("节点ip地址不能为空！");
                swal("节点ip地址不能为空！");
                return;
            }
            var expNodeIp = getTplExpression(nodeIp);
            var expNodeIpRslt = parseTplConstant(expNodeIp,SLIDE_MAJOR_UNIT_MAX + 1);
            if(expNodeIpRslt.length == 0){
                if(!isIpv4(nodeIp)) {
                    //alert("节点IP地址模板格式不正确！");
                    swal("节点IP地址模板格式不正确！");
                    return;
                }
            }
            // if(!confirm("确认生成节点列表？")){
            //     return;
            // }
            swal({
                title:"确认生成节点列表？",
                type:"info",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                closeOnConfirm: true
            },

            function (isConfirm) {
                if(isConfirm){
                    if(expNodeIpRslt.length <= SLIDE_MAJOR_UNIT_MAX || confirm("注意：只能生成最多前 " + SLIDE_MAJOR_UNIT_MAX + " 个新节点，是否继续？")){
                        $("#myModal_add").modal('hide');
                        if(expNodeIpRslt.length == 0){
                                var ip = nodeIp;
                                $("#firstTr").remove();
                                addNodeTr(ip,nodePwd,bossmonChk,bossdsChk,bossmcliChk);
                        }else {
                            var len = expNodeIpRslt.length
                            if(expNodeIpRslt.length>SLIDE_MAJOR_UNIT_MAX){
                                len = SLIDE_MAJOR_UNIT_MAX
                            }
                            for(var i = 0;i <len;i++){
                                var ip = nodeIp.replace(expNodeIp,expNodeIpRslt[i]);
                                if(isIpv4(ip)){
                                    var fisrtTrVal = $("#firstTr td:first-child").val() == undefined ? "":$("#firstTr td:first-child").val().trim(); //防止fisrtTrVal undefined
                                    if((fisrtTrVal=="") && (length=$("#div3 table tbody tr").length==1)){ ////计算table表的当前行数
                                        $("#firstTr").remove();
                                    }
                                    addNodeTr(ip,nodePwd,bossmonChk,bossdsChk,bossmcliChk);
                                }
                            }
                        }
                    }
                }
            });
        });

        //添加历史记录的行
        function addHistoryTr(ip,info){
             var tr = formatString("<tr class='tr'> "
                +"<td>{ip}</td>"
                +"<td>{bossmon}</td>"
                +"<td>{bossds}</td>"
                +"<td>{bosscli}</td>"
                +"</tr>",{ip:ip,bossmon:info["monitor"],bossds:info["dataserver"],bosscli:info["client"]});
            $("#historytb").append(tr);
        }

        //更新历史记录
        $("#historybtn").click(function () {
            $("#historytb").html("");//清空旧数据
            var url = window.location.href;
            $.get(url,{type:"history"},function (data) {
                //alert(data);
                var result=$.parseJSON(data);
                for(var ip in result){
                    addHistoryTr(ip,result[ip]);
                }
            });
        });

        //固定窗口格式
        $("#div1").css("width","1200px");
        $("#div2").css("width","500px");
        $("#div3").css("width","1200px");
        var winHeight= $(window).height();
        $("#div3").css("height",winHeight*0.75+"px")

        //窗口大小变化时，表格占据的位置也要变化
        $(window).resize(function () {
            var winHeight= $(window).height();
            $("#div3").css("height",winHeight*0.75+"px");
        })

        // var w = parseInt($("body").css("width"));
        // $("#div1").css("margin-left",(w-1200)/2+"px");
        // $("#div2").css("margin-left",(w-600)/2+"px");
        // $("#div3").css("margin-left",(w-1200)/2+"px");

    }
);


