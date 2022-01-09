# -*- coding: utf-8 -*-

{
    'name': 'Pos multi UOM',
    'version': '1.0',
    'category': 'Point of Sale',
    'sequence': 6,
    'author': 'SoftShell Solutions',
    'summary': 'Allows you to sell one products in different unit of measure.',
    'description': "Allows you to sell one products in different unit of measure.",
    'depends': ['point_of_sale'],
    'data': [
        # 'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml'
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    'images': [
        'static/description/popup.jpg',
    ],
    'installable': True,
    'website': '',
    'auto_install': False,
    'price': 29,
    'currency': 'EUR',
}
