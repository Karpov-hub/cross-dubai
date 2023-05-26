
Ext.define('Crm.modules.users.view.UsersGrid', {
    extend: 'main.GridContainer',

    title: D.t('Admins'),
    iconCls: 'x-fa fa-users',

    filterbar: true,
    filterable:true,
    
    requires: [
        'Core.grid.ComboColumn'    
    ],
    
    buildColumns: function() {
        return [{
            text: D.t("Login"),
            flex: 1,
            sortable: true,
            hidden:Ext.platformTags.phone,
            filter: true,            
            dataIndex: 'login'
        },{
            xtype: 'combocolumn',
            text: D.t("Group"),
            hidden:Ext.platformTags.phone,
            flex: 1,
            filter: true,            
            model: 'Crm.modules.users.model.GroupsModel',                  
            dataIndex: 'groupid'
        },{
            text: D.t("Name"),
            flex: 1,
            filter: true,            
            sortable: true,
            dataIndex: 'name'
        },{
            text: D.t("Email"),
            hidden:Ext.platformTags.phone,
            flex: 1,
            filter: true,            
            sortable: true,
            dataIndex: 'email'
        },{
            text: D.t("Phone"),
            hidden:Ext.platformTags.phone,
            flex: 1,
            filter: true,            
            sortable: true,
            dataIndex: 'tel'
        }/*,{
            text: D.t("Session password"),
            flex: 1,
            sortable: true,
            dataIndex: 'dblauth',
            renderer: function(v,m) {
                return D.t(v? 'on':'off')    
            }
        }*/]        
    }
    
})
