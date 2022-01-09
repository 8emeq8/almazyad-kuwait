odoo.define('ss_pos_multi_uom', function (require) {
"use strict";

var models = require('point_of_sale.models');
var core = require('web.core');
var PosPopWidget = require('point_of_sale.popups');
var gui = require('point_of_sale.gui');
var screens = require('point_of_sale.screens');
var QWeb = core.qweb;
var _t = core._t;

    models.load_fields('product.product',['has_multi_uom','allow_uoms','show_all_uom']);

    var MulitUOMWidget = PosPopWidget.extend({
        template: 'MulitUOMWidget',

        renderElement: function(){
            var self = this;
            this._super();
            this.$(".multi_uom_button").click(function(){
                var uom_id = $(this).data('uom_id');
                var price = $(this).data('price');
                var line = self.options.selectedOrderLine;
                if(line){
                    line.set_unit_price(price);
                    line.set_product_uom(uom_id);
                }
                
                self.gui.show_screen('products');
            });
        },
        show: function(options){
            var self = this;
            this.options = options || {};
            var modifiers_list = [];
            var orderline = this.options.selectedOrderLine;
            for(var key in self.pos.units_by_id){

                if(self.pos.units_by_id[key].category_id[1]===orderline.get_unit().category_id[1]){
                    if(this.options.product.show_all_uom){
                        var price=orderline.price*orderline.get_unit().factor/self.pos.units_by_id[key].factor;
                        modifiers_list.push({id:self.pos.units_by_id[key].id,name:self.pos.units_by_id[key].display_name,price:price,factor_inv:self.pos.units_by_id[key].factor_inv});
                    }
                    else{
                        if($.inArray( self.pos.units_by_id[key].id, this.options.product.allow_uoms ) >= 0){
                            var price=orderline.price*orderline.get_unit().factor/self.pos.units_by_id[key].factor;
                            modifiers_list.push({id:self.pos.units_by_id[key].id,name:self.pos.units_by_id[key].display_name,price:price,factor_inv:self.pos.units_by_id[key].factor_inv});
                        }
                    }
                }
            }
            options.ss_uom_list = modifiers_list;
            this._super(options); 
            this.renderElement();
        },
    });

    gui.define_popup({
        'name': 'multi-uom-widget', 
        'widget': MulitUOMWidget,
    });

    screens.OrderWidget.include({
        render_orderline: function(orderline){
            var self = this;
            var order = this.pos.get_order();
            var el_str  = QWeb.render('Orderline',{widget:this, line:orderline}); 
            var el_node = document.createElement('div');
                el_node.innerHTML = _.str.trim(el_str);
                el_node = el_node.childNodes[0];
                el_node.orderline = orderline;
                el_node.addEventListener('click',this.line_click_handler);
                $(el_node).find(".uom-button").click(function(event){
                    var selectedOrderLine = order.get_orderline($(this).data('id'));
                    var product = selectedOrderLine.get_product();
                    if(product.has_multi_uom){
                        self.gui.show_popup('multi-uom-widget',{product:product,selectedOrderLine:selectedOrderLine});
                    }
                    event.stopPropagation();
                });
            var el_lot_icon = el_node.querySelector('.line-lot-icon');
            if(el_lot_icon){
                el_lot_icon.addEventListener('click', (function() {
                    this.show_product_lot(orderline);
                }.bind(this)));
            }

            orderline.node = el_node;
            return el_node;
        },
    });
    var _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize: function(attr, options) {
            _super_orderline.initialize.call(this,attr,options);
            this.wvproduct_uom = '';
        },
        set_product_uom: function(uom_id){
            this.wvproduct_uom = this.pos.units_by_id[uom_id];
            this.trigger('change',this);
        },

        get_unit: function(){
            var unit_id = this.product.uom_id;
            if(!unit_id){
                return undefined;
            }
            unit_id = unit_id[0];
            if(!this.pos){
                return undefined;
            }
            return this.wvproduct_uom == '' ? this.pos.units_by_id[unit_id] : this.wvproduct_uom;
        },

        export_as_JSON: function(){
            var unit_id = this.product.uom_id;
            var json = _super_orderline.export_as_JSON.call(this);
            json.product_uom = this.wvproduct_uom == '' ? unit_id.id : this.wvproduct_uom.id;
            return json;
        },
        init_from_JSON: function(json){
            _super_orderline.init_from_JSON.apply(this,arguments);
            this.wvproduct_uom = json.wvproduct_uom;
        },

    });

});

