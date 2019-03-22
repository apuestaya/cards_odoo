# -*- coding: utf-8 -*-
{
'name': 'Pagos con Tarjetas',
'description': "Pasarela de Pago",
'author': "Nakade",
    'website': "https://instagram.com/",
    'summary': "Método de pago",
    'version': '0.1',
    'category': 'module_category_account_voucher',
      # any module necessary for this one to work correctly
    'depends': ['base','sale','payment'],
 
    # always loaded
    'data': [
        #'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    #"external_dependencies": {"python" : ["pytesseract"]},
    'installable': True,
}