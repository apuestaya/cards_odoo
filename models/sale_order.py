from odoo import api, fields, models, _
from odoo.http import request
import hashlib
import decimal
import re
# 4859510000000036 12/20 648

class SaleOrder(models.Model):
    _inherit = 'sale.order'
    acquirer_name = fields.Text(name="acquirer_name", string="acquirer_name", default='')
    @api.model
    def get_sale_order(self, params): 
        signatureKey = "tNRvzbeSeZegCCJXSFA?632676272275"
                       
        query = "select name from payment_acquirer where id = "+str(params['acquirer_id'])+" limit 1"
        request.cr.execute(query)    
        acquirer = request.cr.fetchone()
        acquirer_name = False
        if(acquirer[0]):
           acquirer_name = acquirer[0]

        #get sale order by(state=draft, )    
        query = "select id from sale_order where partner_id = '"+str(params['partner_id'])+"' and state = '"+str('draft')+"' order by date_order desc limit 1"
        request.cr.execute(query)    
        draft_order_id = request.cr.fetchone()

        if(draft_order_id[0]):
           last_confirmed_order = self.env['sale.order'].browse(draft_order_id[0])           

           if(last_confirmed_order):

              #get partner  
              query = "select email from res_partner where id = '"+str(params['partner_id'])+"'"
              request.cr.execute(query)    
              partner = request.cr.dictfetchone()             

              cents = decimal.Decimal('.01')
              amount = decimal.Decimal(last_confirmed_order.amount_total).quantize(cents, decimal.ROUND_HALF_UP)
              order_name = re.sub('[^0-9]','', last_confirmed_order.name)

              #return {last_confirmed_order.partner_shipping_id.country_id.currency_id.name} "00000929500.00PENxTQRaWzmLySxcVP!36645347"
              signatureString =  str(order_name)+str(amount)+str(last_confirmed_order.partner_shipping_id.country_id.currency_id.name)+str(signatureKey)
              signature = hashlib.sha512(signatureString.encode())
              
              return {
                        'status' :  "OK",
                        'name' : last_confirmed_order.partner_shipping_id.name,
                        'phone' : last_confirmed_order.partner_shipping_id.phone,
                        'email' : partner['email'],
                        'address' : last_confirmed_order.partner_shipping_id.street,
                        'city' : last_confirmed_order.partner_shipping_id.city,
                        'state' : last_confirmed_order.partner_shipping_id.state_id.name,
                        'country_code':last_confirmed_order.partner_shipping_id.country_id.code,
                        'country_name':last_confirmed_order.partner_shipping_id.country_id.name,
                        'zip':last_confirmed_order.partner_shipping_id.zip,
                        'acquirer':acquirer_name,  
                        
                        'order_id':last_confirmed_order.id,
                        'order_name':order_name,
                        'order_name_odoo':last_confirmed_order.name,
                        'date_order':last_confirmed_order.date_order,
                        'amount':amount,
                        'currency_code':last_confirmed_order.partner_shipping_id.country_id.currency_id.name,
                        'currency_symbol':last_confirmed_order.partner_shipping_id.country_id.currency_id.symbol,
                        'language':last_confirmed_order.partner_shipping_id.lang,
                        'signature':signature.hexdigest(),
                        'signatureString':signatureString
                     }
        return {'status' :  "FAIL"}
       
    @api.model
    def update_order_status(self,params):
        if(params['status']=="paid"):
         query = "update sale_order set state = 'sale', confirmation_date='"+params['confirmation_date']+"', acquirer_name = '"+params['acquirer_name']+"' where name = '"+params['order_name']+"'"
         request.cr.execute(query) 

         

    #@api.multi
    #def action_button_confirm(self):
    #     res = super(SaleOrder,self).action_button_confirm()
#
    #     if(self.acquirer_name=="Alignet"):
    #        query = "select transaction_id from sale_order_transaction_rel where sale_order_id = '"+str(self.id)+"'"
    #        request.cr.execute(query)
    #        order_transaction_rel = request.cr.dictfetchone() 
    #        if(order_transaction_rel):
    #           query = "update payment_transaction set state = 'done' where id = '"+order_transaction_rel['transaction_id']+"'"
    #           request.cr.execute(query)
    #     
    #     return res
         
        

