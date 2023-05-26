/**
 * @author Vaibhav Mali
 * @Date : 11 April 2018
 */
Ext.define('main.FormController', {
    extend: 'Core.form.FormController',
    
   setControls: function() {
    var me = this;
    me.view.changeArr = [];                
    this.control({
        '[action=formclose]': {click: function(el) {me.closeView()}},
        '[action=apply]': {click: function(el) {
            __CONFIG__.formSave=true;
            me.save(false)
        }},
        '[action=save]': {click: function(el) {
            __CONFIG__.formSave=true;            
            me.save(true)
        }},
        '[action=refreshFormData]': {
            click: function(el) {
                me.refreshFormData();
            } 
         },
        '[action=remove]': {click: function(el) {me.deleteRecord_do(true)}},
        '[action=copy]': {click: function(el) {me.copyRecord(true)}},
        '[action=gotolist]': {click: function(el) {me.closeCheck()}}
    })
    this.view.on('activate', function(grid, indx) {
        if(!me.oldDocTitle)
            me.oldDocTitle = document.title
    })
    me.view.on('save', function (a, b, c) {
        me.view.changeArr = [];  
        me.view.changeFlag = false;
    }) 
    this.view.on('close', function(grid, indx) {
        if(me.oldDocTitle) document.title = me.oldDocTitle
     })
    this.view.down('form').on({
        validitychange: function ( th , valid , eOpts ) {
            var el = me.view.down('[action=apply]');
            if(el) el.setDisabled(!valid)
            el = me.view.down('[action=save]');
            if(el) el.setDisabled(!valid)
        }
    })
    me.view.down('form').getForm().getFields().each(function(field){
            field.on('change',function(f,n,o){
                var dateFlag = false;
                if(f.xtype == 'datefield' || f.xtype == 'xdatefield'){
                     n=new Date(n).toLocaleDateString();
                     dateFlag = true
                }
                if(me && me.view && f && f.name && me.view.currentData && (me.view.currentData[f.name] != undefined) && (dateFlag ? (new Date(me.view.currentData[f.name]).toLocaleDateString() != n) : (me.view.currentData[f.name] != n))){
                    me.view.changeFlag = true;
                    var i = 0,changeIndex = 0,changeExist = false;
                    for(i=0;i<me.view.changeArr.length;i++){
                        if(f.name == me.view.changeArr[i].name){
                            changeExist = true;
                            changeIndex = i;
                            break;
                        }
                    }
                    if(changeExist){
                        me.view.changeArr[changeIndex].name = f.name;
                        me.view.changeArr[changeIndex].newValue = n;
                    }
                    else{
                        var dt = {};
                        dt.name = f.name;
                        dt.oldValue = o;
                        dt.newValue = n;
                        me.view.changeArr.push(dt);
                    }
                }
            });
        });
    this.checkPermissions()
 }


,closeCheck: function() {
    var me = this;
    if(me && me.view && me.view.changeFlag){
        Ext.Msg.confirm(D.t('Closing'), D.t('Do you want to save?',[]), function(btn){
            if (btn == 'yes'){
                me.save(false,function(data){
                        me.view.changeArr = [];  
                        me.view.changeFlag = false;   
                        __CONFIG__.refreshNeeded=true;                            
                        me.gotoListView();
                });
            }
            else{
                var i = 0;
                for(i=0;i<me.view.changeArr.length;i++){
                    if(me && me.view && me.view.down("[name="+me.view.changeArr[i].name+"]")) me.view.down("[name="+me.view.changeArr[i].name+"]").setValue(me.view.changeArr[i].oldValue);
                }
                me.view.changeFlag = false;                                              
                me.view.changeArr = [];   
                __CONFIG__.refreshNeeded=true;                                             
                me.gotoListView();
            }
        })
    }
    else{
        __CONFIG__.refreshNeeded=true;  
        me.gotoListView();        
    }
 }

 ,save: function(closewin, cb) {
    var me = this,
        form = me.view.down('form').getForm(),
        data = {};
    
    var sb1 = me.view.down('[action=save]')
        ,sb2 = me.view.down('[action=apply]')
    
    if(sb1 && !!sb1.setDisabled) sb1.setDisabled(true)
    if(sb2 && !!sb2.setDisabled) sb2.setDisabled(true)
    
    if(form) {
        data = form.getValues() 
    }
    
    var setButtonsStatus = function() {
        if(sb1 && !!sb1.setDisabled) sb1.setDisabled(false)
        if(sb2 && !!sb2.setDisabled) sb2.setDisabled(false)
    }

    if(me.view.fireEvent('beforesave', me.view, data) === false) {
        setButtonsStatus();
        return;
    }
    if(me.view.down('[action=refreshFormData]')){
        me.model.runOnServer("checkMtime",{_id:data._id,mtime:data.mtime},function(mTimeFlag){
            if(mTimeFlag){
                D.a(D.t('Record Modified Error'),D.t('Record has modified please refresh form and then save it.'))
                me.view.down('[action=apply]').setDisabled(false)
                return;
            }else{
                me.model.write(data, function(data, err) {
                    me.refreshFormData();                    
                    if(data && data.record && data.record.signobject && data.record.signobject.shouldSign)
                        me.view.addSignButton(data.record.signobject)
                        setButtonsStatus()
                        if(err) {
                        me.showErrorMessage(err)//win, err)
                        return;
                    }
                    if(me.view.fireEvent('save', me.view, data) === false) {
                        if(!!cb) cb(data)
                        return;
                    }
                    if(closewin && !!me.view.close) 
                        me.view.close()
                    if(!!cb) cb(data)
                })  
            }
        }) 
    }else{
        me.model.write(data, function(data, err) {
            me.refreshFormData();
            if(data && data.record && data.record.signobject && data.record.signobject.shouldSign)
                me.view.addSignButton(data.record.signobject)
                setButtonsStatus()
                if(err) {
                me.showErrorMessage(err)//win, err)
                return;
            }
            if(me.view.fireEvent('save', me.view, data) === false) {
                if(!!cb) cb(data)
                return;
            }
            if(closewin && !!me.view.close) 
                me.view.close()
            if(!!cb) cb(data)
        })  
    } 
}

,refreshFormData:function(){
    var me=this;
    var fm = me.view.down('form');
    var params={
        filters:[
            {property:'_id',value:(fm&&fm.config&&fm.config.$initParent&&fm.config.$initParent.recordId)?(fm.config.$initParent.recordId):window.location.hash.split('~')[1]}
        ]
    }
    me.model.runOnServer('getData',params, function (res) {
        if(res&&res.list&&res.list.length){
            me.view.down('form').getForm().setValues(res.list[0]); 
        }
    })
}

 ,disableField: function(name) {
    if(this&&this.view&&this.view.down()&&this.view.down('[name='+name+']')){
        var fld = this.view.down('[name='+name+']')
        if(fld && !!fld.setReadOnly)
            fld.setReadOnly(true)
    }
 }
        
})