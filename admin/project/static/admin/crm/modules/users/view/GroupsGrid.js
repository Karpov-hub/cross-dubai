
Ext.define('Crm.modules.users.view.GroupsGrid', {
    extend: 'main.GridContainer',

    title: D.t('Groups'),
    iconCls: 'x-fa fa-users',    
    filterbar: true,
    filterable: true,
    
    buildColumns: function() {
        return [{
            text: D.t("Group name"),
            flex: 1,
            sortable: true,
            filter: true,
            dataIndex: 'name'
        },{
            text: D.t("Code"),
            flex: 1,
            sortable: true,
            filter: true,
            dataIndex: 'code'
        },{
            text: D.t("Description"),
            flex: 1,
            sortable: true,
            filter: true,
            dataIndex: 'description'
        }];
    }
})
