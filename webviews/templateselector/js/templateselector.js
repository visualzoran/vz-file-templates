var templateSel = {
    _vscode : null,
    _data : null,
    _category : null,
    _categoryId : 0,
    _templateId : 0,
    _allCategories : [],
    _allItems : [],
    _catTreeItems : [],

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
                this.setDestPath(message.destPath);
                this.setData(message.data, message.title, message.browseDestPath);
                break;
            case 'setDestPath':
                this.setDestPath(message.destPath);
                break;
        }
    },

    sendMessage : function(data) {
        this._vscode.postMessage(data);    
    },

    setDestPath : function(destPath) {
        $('#inpLocation').val(destPath);
    },

    setData : function(data, title, browseDestPath) {
        this._data = data;
        this._catTreeItems = [];
        this._allCategories = [];

        $('#title').html(title);
        if (!browseDestPath) {
            $('#locationrow').hide();
            $('#makedirrow').hide();
        }

        //process categories
        this.processCategories(this._data);

        //render categories
        var selId = 0;
        var content = "";
        if ((this._data) && (this._data.childCategories)) {
            $('#categories').html('');
            selId = this.buildCategoryTree(this._data.childCategories, $('#categories'), 0);
        }

        this.selectCategory(selId);

        $('#categories').focus();
    },

    buildCategoryTree : function(catList, parentDiv, level) {  
        var selId = 0;
        var subSelId = 0;
        var mainDiv = $('<div/>', {class:'catlist'});
        
        for (var i=0; i < catList.length; i++) {
            var category = catList[i];
            var catDiv = $('<div/>', {
                id: 'catcont' + category.id,
                class: 'cat'
            });
            
            this._catTreeItems.push(category);

            if ((category.selected) && (category.id))
                selId = category.id;

            //catDiv.append($('<div/>', {class:'catswitch'}));
            //var catCont = $('<div/>', {class:'catcontent'});
            //catDiv.append(catCont);

            var indent = 4 + (10*level);

            catDiv.append($('<div/>', {
                class: 'catname',
                id: 'catname' + category.id,
                onclick: 'templateSel.selectCategory(' + category.id + ')',
                style: 'padding-left:' + indent + 'px;',
                text : category.name
            }));
            mainDiv.append(catDiv);

            if (category.childCategories) {
                subSelId = this.buildCategoryTree(category.childCategories, mainDiv, level+1);
                if (subSelId != 0)
                    selId = subSelId;
            }

        }

        parentDiv.append(mainDiv);

        return selId;
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

    findCategoryIndex : function(id) {
        if ((this._catTreeItems) && (this._catTreeItems.length > 0)) {
            for (var i=0; i<this._catTreeItems.length; i++) {
                if (this._catTreeItems[i].id == id)
                    return i;
            }
        }
        return -1;
    },

    selectCategory : function(id) {
        $('#catname' + this._categoryId).attr('class', 'catname');
        this._category = this.findCategory(id);
        if (this._category)
            this._categoryId = this._category.id;
        else
            this._categoryId = id;
        $('#catname' + this._categoryId).attr('class', 'catname selected');
        this.scrollTo('categories', 'catcont' + this._categoryId);

        var selTemplateId = this.buildTemplateList(this._category);

        this.selectTemplate(selTemplateId); //this._templateId);
    },

    moveCategorySelection: function(steps) {
        if ((this._catTreeItems) && (this._catTreeItems.length > 0)) {
            var idx = 0;
            if (this._categoryId) {
                idx = this.findCategoryIndex(this._categoryId);
                if (idx >= 0)
                    idx = idx + steps;
            }
            this.selectCategoryByIndex(idx);
        }
    },

    selectCategoryByIndex : function(idx) {
        if ((this._catTreeItems) && (this._catTreeItems.length > 0)) {
            if (idx >= this._catTreeItems.length)
                idx = this._catTreeItems.length - 1;
            if (idx < 0)
                idx = 0;
            this.selectCategory(this._catTreeItems[idx].id);
        }
    },

    categoriesPerPage : function() {
        var totalHeight = $('#categories').height();
        var itemHeight = $('.catname').height();
        if ((totalHeight) && (itemHeight) && (itemHeight > 0) && (totalHeight > 0))
            return Math.trunc(totalHeight/itemHeight);
    },

    buildTemplateList : function(category) {
        var selId = 0;
        $('#templates').html('');
        if ((category) && (category.items)) {
            var elements = [];
            for (var i=0; i<category.items.length; i++) {
                var item = category.items[i];
                if (item.selected) {
                    selId = item.id;
                    item.selected = false;
                }

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
        return selId;
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

    findTemplateIndex: function(id) {
        if ((this._category) && (this._category.items) && (this._category.items.length > 0)) {
            for (var i=0; i<this._category.items.length; i++) {
                if (this._category.items[i].id == id)
                    return i;
            }
        }
        return -1;
    },

    scrollTo : function(parentId, elementId) {
        var parent = document.getElementById(parentId);
        var element = document.getElementById(elementId);

        var sTop = parent.scrollTop;
        var sHeight = parent.offsetHeight;

        var elemTop = element.offsetTop - parent.offsetTop;
        var elemHeight = element.offsetHeight;

        if (elemTop < sTop) {
            parent.scrollTop = elemTop;
            //$('#' + parentId).animate({ scrollTop: elemTop}, 200);
        } else if ((elemTop + elemHeight) > (sTop + sHeight)) {
            parent.scrollTop = (elemTop + elemHeight - sHeight);
            //$('#' + parentId).animate({ scrollTop: (elemTop + elemHeight - sHeight)}, 200);
        }
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
        this.scrollTo('templates', 'templ' + this._templateId);
    },

    moveTemplateSelection: function(steps) {
        if ((this._category) && (this._category.items) && (this._category.items.length > 0)) {
            var idx = 0;
            if (this._templateId) {
                idx = this.findTemplateIndex(this._templateId);
                if (idx >= 0)
                    idx = idx + steps;
            }
            this.selectTemplateByIndex(idx);
        }
    },

    selectTemplateByIndex : function(idx) {
        if ((this._category) && (this._category.items) && (this._category.items.length > 0)) {
            if (idx >= this._category.items.length)
                idx = this._category.items.length - 1;
            if (idx < 0)
                idx = 0;
            this.selectTemplate(this._category.items[idx].id);
        }
    },

    templatesPerPage : function() {
        var totalHeight = $('#templates').height();
        var itemHeight = $('.template').height();
        if ((totalHeight) && (itemHeight) && (itemHeight > 0) && (totalHeight > 0))
            return Math.trunc(totalHeight/itemHeight);
    },

    okClick : function() {
        this.sendMessage({
            command: 'okClick',
            templateId: this._templateId,            
            name : $('#inpName').val(),
            destPath : $('#inpLocation').val(),
            mkDir: $('#mkdir').prop('checked')
        });
    },

    cancelClick : function() {
        this.sendMessage({
            command: 'cancelClick'
        });
    },

    browseLocation : function() {
        this.sendMessage({
            command: 'browseDestPath',
            destPath: $('#inpLocation').val()
        });
    },

    inpKeyPress : function(e) {
        var handled = false;

        switch (e.which) {
            case 27:    //escape
                this.cancelClick();
                handled = true;
                break;
            case 13:    //enter
            this.okClick();
                handled = true;
                break;
        }

        if (handled) {
            e.preventDefault();
            return false;
        }
    },

    catKeyPress : function(e) {
        var diff = 0;
        var handled = false;

        switch (e.which) {
            case 27:    //escape
                this.cancelClick();
                handled = true;
                break;
            case 13:    //enter
            case 39:    //right
                $('#templates').focus();
                handled = true;
                break;
            case 38:    //up
                this.moveCategorySelection(-1);
                handled = true;
                break;
            case 40:    //down
                this.moveCategorySelection(1);
                handled = true;
                break;
            case 33:    //page up
                diff = this.categoriesPerPage();
                if (diff > 0)
                    this.moveCategorySelection(-diff);
                handled = true;
                break;
            case 34:    //page down
                diff = this.categoriesPerPage();
                if (diff > 0)
                    this.moveCategorySelection(diff);
                handled = true;
                break;
            case 36:    //home
                this.selectCategoryByIndex(0);
                handled = true;
                break;
            case 35:    //end
                if ((this._catTreeItems) && (this._catTreeItems.length > 0)) {
                    this.selectCategoryByIndex(this._catTreeItems.length - 1);
                    handled = true;
                    break;
                }
        }

        if (handled) {
            e.preventDefault();
            return false;
        }
    },

    tmpKeyPress : function(e) {
        var diff = 0;
        var handled = false;

        switch (e.which) {
            case 27:    //escape
                this.cancelClick();
                handled = true;
                break;
            case 37:    //left
                $('#categories').focus();
                handled = true;
                break;
            case 13:    //enter
                $('#inpName').focus();
                handled = true;
                break;
            case 38:    //up
                this.moveTemplateSelection(-1);
                handled = true;
                break;
            case 40:    //down
                this.moveTemplateSelection(1);
                handled = true;
                break;
            case 33:    //page up
                diff = this.templatesPerPage();
                if (diff > 0)
                    this.moveTemplateSelection(-diff);
                handled = true;
                break;
            case 34:    //page down
                diff = this.templatesPerPage();
                if (diff > 0)
                    this.moveTemplateSelection(diff);
                handled = true;
                break;
            case 36:    //home
                this.selectTemplateByIndex(0);
                handled = true;
                break;
            case 35:    //end
                if ((this._category) && (this._category.items) && (this._category.items.length > 0)) {
                    this.selectTemplateByIndex(this._category.items.length - 1);
                    handled = true;
                    break;
                }
        }

        if (handled) {
            e.preventDefault();
            return false;
        }

    }



};

$(function() {
    templateSel.initialize();
});
