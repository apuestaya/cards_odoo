# -*- coding: utf-8 -*-
from odoo import http
from odoo.exceptions import Warning
import os
from odoo.http import request
import requests
import hashlib
import decimal
import re
class Alignet(http.Controller):

    @http.route('/alignet/update_order_status/', methods=['POST'], type='json', auth="public", website=True)
    def update_order_status(self,**kw):
        status = kw.get('status')
        confirmation_date = kw.get('confirmation_date')
        acquirer_name = kw.get('acquirer_name')
        order_name = kw.get('order_name')

        if(status=="paid"):
           query = "update sale_order set state = 'sale', confirmation_date='"+confirmation_date+"', acquirer_name = '"+acquirer_name+"' where name = '"+order_name+"'"
           request.cr.execute(query)

    @http.route('/alignet/get_sale_order/', methods=['POST'], type='json', auth="public", website=True)
    def get_sale_order(self, **kw): 
        signatureKey = "xTQRaWzmLySxcVP!36645347"
        params = {}
        params['acquirer_id'] = kw.get('acquirer_id')            
        params['partner_id'] = kw.get('partner_id')  

        query = "select name from payment_acquirer where id = "+str(params['acquirer_id'])+" limit 1"
        request.cr.execute(query)    
        acquirer = request.cr.dictfetchone()
        acquirer_name = False
        if(acquirer['name']):
           acquirer_name = acquirer['name']

        #get sale order by(state=draft, )    
        query = "select id, name, amount_total, date_order, partner_shipping_id from sale_order where partner_id = '"+str(params['partner_id'])+"' and state = '"+str('draft')+"' order by date_order desc limit 1"
        request.cr.execute(query)    
        draft_order = request.cr.dictfetchone()

       
        query = "select res_partner.id, res_partner.name, res_partner.phone, res_partner.email, res_partner.street, res_partner.city, res_partner.zip, res_partner.lang, res_country.name as country_name, res_country.code as country_code, res_country_state.name as state_name, res_currency.name as currency_name, res_currency.symbol as currency_symbol from res_partner left join res_country on res_country.id = res_partner.country_id left join res_country_state on res_country_state.id = res_partner.state_id left join res_currency on res_country.currency_id = res_currency.id   where res_partner.id = '"+str(draft_order['partner_shipping_id'])+"' limit 1"
        request.cr.execute(query)    
        res_partner_shipping = request.cr.dictfetchone()
        
        #return {'na':res_partner_shipping}
  
        if(draft_order):         

            cents = decimal.Decimal('.01')
            amount = decimal.Decimal(draft_order['amount_total']).quantize(cents, decimal.ROUND_HALF_UP)
            order_name = re.sub('[^0-9]','', draft_order['name'])

            #return {res_partner_shipping.country_id.currency_id.name} "00000929500.00PENxTQRaWzmLySxcVP!36645347"
            signatureString =  str(order_name)+str(amount)+str(res_partner_shipping['currency_name'])+str(signatureKey)
            signature = hashlib.sha512(signatureString.encode())
            
            return {
                        'status' :  "OK",
                        'name' : res_partner_shipping['name'],
                        'phone' : res_partner_shipping['phone'],
                        'email' : res_partner_shipping['email'],
                        'address' : res_partner_shipping['street'],
                        'city' : res_partner_shipping['city'],
                        'state' : res_partner_shipping['state_name'],
                        'country_code':res_partner_shipping['country_code'],
                        'country_name':res_partner_shipping['country_name'],
                        'zip':res_partner_shipping['zip'],
                        'acquirer':acquirer_name,  
                        
                        'order_id':draft_order['id'],
                        'order_name':order_name,
                        'order_name_odoo':draft_order['name'],
                        'date_order':draft_order['date_order'],
                        'amount':amount,
                        'currency_code':res_partner_shipping['currency_name'],
                        'currency_symbol':res_partner_shipping['currency_symbol'],
                        'language':res_partner_shipping['lang'],
                        'signature':signature.hexdigest(),
                        'signatureString':signatureString
                    }
        return {'status' :  "FAIL"}
