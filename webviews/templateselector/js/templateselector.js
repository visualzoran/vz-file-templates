var templateSel = {
    _vscode : null,
    _data : null,
    _category : null,
    _categoryId : 0,
    _templateId : 0,
    _allCategories : [],
    _allItems : [],

    initialize : function() {
        this._vscode = acquireVsCodeApi();
       
        // Handle messages sent from the extension to the webview
        var me = this;
        window.addEventListener('message', event => {
            me.onMessage(event.data);
        });

        this.sendMessage({
            command: 'documentLoaded'
        });
        
    },

    onMessage : function(message) {     
        switch (message.command) {
            case 'setData':
                this.setData(message.data);
                break;
        }
    },

    sendMessage : function(data) {
        this._vscode.postMessage(data);    
    },

    setData : function(data) {
        this._data = data;

        //process categories
        this.processCategories(this._data);

        //render categories
        var content = "";
        if ((this._data) && (this._data.childCategories)) {
            $('#categories').html('');
            this.buildCategoryTree(this._data.childCategories, $('#categories'));
        }
        this.selectCategory(0);
    },

    buildCategoryTree : function(catList, parentDiv) {       
        var mainDiv = $('<div/>', {class:'catlist'});
        
        for (var i=0; i < catList.length; i++) {
            var category = catList[i];
            var catDiv = $('<div/>', {class:'cat'});
            
            catDiv.append($('<div/>', {class:'catswitch'}));
            catDiv.append($('<div/>', {
                class: 'catname',
                id: 'catname' + category.id,
                onclick: 'templateSel.selectCategory(' + category.id + ')',
                text : category.name
            }));
            mainDiv.append(catDiv);

            if (category.childCategories)
                this.buildCategoryTree(category.childCategories, mainDiv);
        }

        parentDiv.append(mainDiv);
    },

    processCategories : function(category) {
        //process child categories
        if ((category) && (category.childCategories)) {
            for (var i=0; i<category.childCategories.length; i++) {
                this.processCategories(category.childCategories[i]);
                this.copyTemplates(category.childCategories[i], category);
                this._allCategories[category.childCategories[i].id] = category.childCategories[i];
            }
        }
        //sort items
        if ((category) && (category.items)) {
            category.items.sort(function(a, b) {
                var asort = a.sortOrder;
                var bsort = b.sortOrder;
                var aname = a.name;
                var bname = b.name;
                if ((asort) && (bsort)) {
                    var val = asort.localeCompare(bsort);
                    if (val != 0)
                        return val;
                }
                if ((aname) && (bname))
                    return aname.localeCompare(bname);
                return 0;
            });
        }
    },

    copyTemplates : function(src, dest) {
        if (!dest.items)
            dest.items = [];
        if (src.items) {
            for (var i=0; i<src.items.length; i++) {
                dest.items.push(src.items[i]);
            }
        }
    },

    findCategory : function(id) {
        var category = this._allCategories[id];
        if (category)
            return category;        
        if (this._data)
            return this._data.childCategories[0];
        return null;
    },

    selectCategory : function(id) {
        $('#catname' + this._categoryId).attr('class', 'catname');
        this._category = this.findCategory(id);
        if (this._category)
            this._categoryId = this._category.id;
        else
            this._categoryId = id;
        $('#catname' + this._categoryId).attr('class', 'catname selected');

        //var content = "";
        //if (this._category)
            //content = Handlebars.templates.templist(this._category);        
        //$('#templates').html(content);
        this.buildTemplateList(this._category);
        
        this.selectTemplate(this._templateId);
    },

    buildTemplateList : function(category) {
        $('#templates').html('');
        if ((category) && (category.items)) {
            var elements = [];
            for (var i=0; i<category.items.length; i++) {
                var item = category.items[i];

                var mainDiv = $('<div/>', {
                    class:'template',
                    id:'templ' + item.id,
                    onclick:'templateSel.selectTemplate(' + item.id + ')'
                });

                var iconDiv = $('<div/>', {class:'icon'});
                iconDiv.append($('<img>', {
                    class:'lighticon',
                    src:item.iconLight}));
                iconDiv.append($('<img>', {
                        class:'darkicon',
                        src:item.iconDark}));
                
                mainDiv.append(iconDiv);
                
                mainDiv.append($('<div/>', {
                    class:'desc',
                    text: item.name}));

                elements.push(mainDiv);
            }
            $('#templates').append(elements);
        }
    },

    findTemplate : function(id) {        
        if ((this._category) && (this._category.items) && (this._category.items.length > 0)) {
            for (var i=0; i<this._category.items.length; i++) {
                if (this._category.items[i].id == id)
                    return this._category.items[i];
            }
            return this._category.items[0];
        }
        return null;
    },

    selectTemplate : function(id) {
        //try to find template
        var template = this.findTemplate(id);
        if (template) {
            id = template.id;
            if ((id != this._templateId) && (template.defaultName))
                $('#inpName').val(template.defaultName);
            if (!template.description)
                template.description = '';
            $('#description').text(template.description);
        } else {
            id = 0;
            $('#description').text('');
        }
        $('#templ' + this._templateId).attr('class', 'template');
        this._templateId = id;
        $('#templ' + this._templateId).attr('class', 'template selected');
    },

    okClick : function() {
        this.sendMessage({
            command: 'okClick',
            templateId: this._templateId,
            name : $('#inpName').val()
        })
    },

    cancelClick : function() {
        this.sendMessage({
            command: 'cancelClick'
        })
    }

};

$(function() {
    templateSel.initialize();
});
