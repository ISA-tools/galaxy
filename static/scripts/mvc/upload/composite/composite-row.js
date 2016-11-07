define(["utils/utils","mvc/upload/upload-settings","mvc/upload/upload-ftp","mvc/ui/ui-popover","mvc/ui/ui-misc","mvc/ui/ui-select","utils/uploadbox"],function(a,b,c,d,e){return Backbone.View.extend({status_classes:{init:"upload-mode fa fa-exclamation text-primary",ready:"upload-mode fa fa-check text-success",running:"upload-mode fa fa-spinner fa-spin",success:"upload-mode fa fa-check",error:"upload-mode fa fa-exclamation-triangle"},initialize:function(a,b){var c=this;this.app=a,this.model=b.model,this.setElement(this._template()),this.$source=this.$(".upload-source"),this.$settings=this.$(".upload-settings"),this.$status=this.$(".upload-status"),this.$text=this.$(".upload-text"),this.$text_content=this.$(".upload-text-content"),this.$info_text=this.$(".upload-info-text"),this.$info_progress=this.$(".upload-info-progress"),this.$file_name=this.$(".upload-file-name"),this.$file_desc=this.$(".upload-file-desc"),this.$file_size=this.$(".upload-file-size"),this.$progress_bar=this.$(".upload-progress-bar"),this.$percentage=this.$(".upload-percentage"),this.uploadinput=this.$el.uploadinput({ondragover:function(){c.model.get("enabled")&&c.$el.addClass("warning")},ondragleave:function(){c.$el.removeClass("warning")},onchange:function(a){"running"!=c.model.get("status")&&a&&a.length>0&&(c.model.reset({file_data:a[0],file_name:a[0].name,file_size:a[0].size,file_mode:a[0].mode||"local"}),c._refreshReady())}}),this.button_menu=new e.ButtonMenu({icon:"fa-caret-down",title:"Select",pull:"left"}),this.$source.append(this.button_menu.$el),this.button_menu.addMenu({icon:"fa-laptop",title:"Choose local file",onclick:function(){c.uploadinput.dialog()}}),this.app.ftp_upload_site&&this.button_menu.addMenu({icon:"fa-folder-open-o",title:"Choose FTP file",onclick:function(){c._showFtp()}}),this.button_menu.addMenu({icon:"fa-edit",title:"Paste/Fetch data",onclick:function(){c.model.reset({file_mode:"new",file_name:"New File"})}}),this.ftp=new d.View({title:"Choose FTP file:",container:this.$source.find(".ui-button-menu"),placement:"right"}),this.settings=new d.View({title:"Upload configuration",container:this.$settings,placement:"bottom"}),this.$text_content.on("change input",function(a){c.model.set({url_paste:$(a.target).val(),file_size:$(a.target).val().length}),c._refreshReady()}),this.$settings.on("click",function(){c._showSettings()}).on("mousedown",function(a){a.preventDefault()}),this.listenTo(this.model,"change:percentage",function(){c._refreshPercentage()}),this.listenTo(this.model,"change:status",function(){c._refreshStatus()}),this.listenTo(this.model,"change:info",function(){c._refreshInfo()}),this.listenTo(this.model,"change:file_name",function(){c._refreshFileName()}),this.listenTo(this.model,"change:file_mode",function(){c._refreshMode()}),this.listenTo(this.model,"change:file_size",function(){c._refreshFileSize()}),this.listenTo(this.model,"remove",function(){c.remove()}),this.app.collection.on("reset",function(){c.remove()})},render:function(){this.$el.attr("id","upload-row-"+this.model.id),this.$file_name.html(this.model.get("file_name")||"-"),this.$file_desc.html(this.model.get("file_desc")||"Unavailable"),this.$file_size.html(a.bytesToString(this.model.get("file_size"))),this.$status.removeClass().addClass(this.status_classes.init)},remove:function(){Backbone.View.prototype.remove.apply(this)},_refreshReady:function(){this.app.collection.each(function(a){a.set("status",a.get("file_size")>0&&"ready"||"init")})},_refreshMode:function(){var a=this.model.get("file_mode");"new"==a?(this.height=this.$el.height(),this.$text.css({width:this.$el.width()-16+"px",top:this.$el.height()-8+"px"}).show(),this.$el.height(this.$el.height()-8+this.$text.height()+16),this.$text_content.val("").trigger("keyup")):(this.$el.height(this.height),this.$text.hide())},_refreshInfo:function(){var a=this.model.get("info");a?this.$info_text.html("<strong>Failed: </strong>"+a).show():this.$info_text.hide()},_refreshPercentage:function(){var a=parseInt(this.model.get("percentage"));0!=a?this.$progress_bar.css({width:a+"%"}):(this.$progress_bar.addClass("no-transition"),this.$progress_bar.css({width:"0%"}),this.$progress_bar[0].offsetHeight,this.$progress_bar.removeClass("no-transition")),this.$percentage.html(100!=a?a+"%":"Adding to history...")},_refreshStatus:function(){var a=this.model.get("status");this.$status.removeClass().addClass(this.status_classes[a]),this.model.set("enabled","running"!=a),this.$text_content.attr("disabled",!this.model.get("enabled")),this.$el.removeClass("success danger warning"),("running"==a||"ready"==a)&&this.model.set("percentage",0),this.$source.find(".button")["running"==a?"addClass":"removeClass"]("disabled"),"success"==a&&(this.$el.addClass("success"),this.model.set("percentage",100),this.$percentage.html("100%")),"error"==a?(this.$el.addClass("danger"),this.model.set("percentage",0),this.$info_progress.hide(),this.$info_text.show()):(this.$info_progress.show(),this.$info_text.hide())},_refreshFileName:function(){this.$file_name.html(this.model.get("file_name")||"-")},_refreshFileSize:function(){this.$file_size.html(a.bytesToString(this.model.get("file_size")))},_showFtp:function(){if(this.ftp.visible)this.ftp.hide();else{var a=this;this.ftp.empty(),this.ftp.append(new c({ftp_upload_site:this.app.ftp_upload_site,onchange:function(b){a.ftp.hide(),"running"!=a.model.get("status")&&b&&(a.model.reset({file_mode:"ftp",file_name:b.path,file_size:b.size,file_path:b.path}),a._refreshReady())}}).$el),this.ftp.show()}},_showSettings:function(){this.settings.visible?this.settings.hide():(this.settings.empty(),this.settings.append(new b(this).$el),this.settings.show())},_template:function(){return'<tr class="upload-row"><td><div class="upload-source"/><div class="upload-text-column"><div class="upload-text"><div class="upload-text-info">You can tell Galaxy to download data from web by entering URL in this box (one per line). You can also directly paste the contents of a file.</div><textarea class="upload-text-content form-control"/></div></div></td><td><div class="upload-status"/></td><td><div class="upload-file-desc upload-title"/></td><td><div class="upload-file-name upload-title"/></td><td><div class="upload-file-size upload-size"/></td><td><div class="upload-settings upload-icon-button fa fa-gear"/></td><td><div class="upload-info"><div class="upload-info-text"/><div class="upload-info-progress progress"><div class="upload-progress-bar progress-bar progress-bar-success"/><div class="upload-percentage">0%</div></div></div></td></tr>'}})});
//# sourceMappingURL=../../../../maps/mvc/upload/composite/composite-row.js.map