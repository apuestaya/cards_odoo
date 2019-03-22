
odoo.define('module.Alignet', function (require) 
{
    "use strict";
    var rpc = require('web.rpc');

    $(document).ready(function()
    {
        if($("#payment_method").length>0)
        {
            $("#o_payment_form_pay").hide();
            $("#o_payment_form_pay").after(function()
            {
                return "<button id='initPagarAlignet' class='btn btn-primary'>Pagar ahora <i class='fa fa-chevron-right'></i></button>";
            });
            $(".oe_cart").append('<div style="width:100%;position: absolute;top: 0px;padding-top: 23px;background: white;height: 100%; display:none" id="align-payment-form"><br><button class="btn btn-default hideFormproperly" ><i class="fa fa-chevron-left"></i> Volver</button><div id="alg-paymeform-container" style="margin: 0 auto; max-width: 348px;"></div></div>');

            $(".payment_option_name").each(function( index ) 
              {
                if($(this).text()=="Alignet")
                {
                    $(this).text("Tarjetas débito/crédito") 
                }
              });
        }

        $(document).on("click","#initPagarAlignet",function(event)
        {
            event.preventDefault();
            var partner_id = $(".o_payment_form").attr("data-partner-id");
            var acquirer_id = $('input[name="pm_id"]:checked').attr("data-acquirer-id");
            
                rpc.query({
                    model:'sale.order',
                    method:'get_sale_order',
                    args:[{partner_id:partner_id,acquirer_id:acquirer_id}],
                }).then(function (result) 
                    {    
                        if(result.acquirer=="Alignet")                   
                        {
                         initFormAlignet(result);
                         displayFormproperly();   
                        }
                        else
                        {
                            $("#o_payment_form_pay").click();
                        }
                        
                    });
        });

        $(document).on("click",".hideFormproperly",function(event)
        {
            hideFormproperly();  
        });
        
        
    });
      
    function initFormAlignet(data)
    {
        PF.Init.execute(
            {
                data: 
                {
                        operation:  {
                                        operationNumber: data.order_name,
                                        amount: (data.amount),
                                        currency: {
                                        code: data.currency_code,
                                        symbol: data.currency_symbol+"."
                                    },
                        productDescription: 'Pago pedido '+ data.order_name
                        },
                        customer:   {
                                        name: data.name,
                                        lastname: data.name,
                                        email: data.email,
                                        address: data.address,
                                        zip: data.zip,
                                        city: data.city,
                                        state: data.state,
                                        country: data.country_name,
                                        phone: data.phone
                                    },
                        signature: data.signature
                },
                listeners: {
                            afterPay: function(response) 
                                {
                                    if(response.messageCode=="00")
                                    {
                                        rpc.query({
                                            model:'sale.order',
                                            method:'update_order_status',
                                            args:[{order_name:data.order_name_odoo,confirmation_date:data.date_order,order_id:data.order_id,acquirer_name:data.acquirer,"status":"paid"}],
                                        }).then(function (result) 
                                            {
                                                $("#o_payment_form_pay").click(); 
                                            });
                                        
                                    }
                                    else
                                    {
                                        //swal({
                                        //        title: "Lo Sentimos",
                                        //        text: response.message,
                                        //        type: "warning",
                                        //        showCancelButton: true,
                                        //        cancelButtonText: "Probar de nuevo",
                                        //        closeOnCancel: true
                                        //     });
                                    }

                                }
                            },
                            settings: 
                                {
                                    key:'-----BEGIN PUBLIC KEY-----\n'+
                                    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmF2r4muyz40noeOBpEl6ESMy+\n'+
                                    '/VVamWrPR4yq+q51fIHLn7TZ5lbMO++YmcMIKbHxpc9NJ+kE+PcisUdEJ1OGJ57E\n'+
                                    'XgELOTI4Qmp/uk6+IDW08OPgiXSoak139Y91dzc+mQwBx/eTqSZhJ7EPSc2KckS/\n'+
                                    'xtV/0grIk64kHI3wTQIDAQAB\n'+
                                    '-----END PUBLIC KEY-----',
                                    locale: data.language,
                                    identifier: '9919',
                                    brands: ['VISA','MSCD','AMEX','DINC'],
                                    responseType: 'extended'
                                },
                });
               
    }

    function displayFormproperly()
    {
        
        $("#align-payment-form").fadeIn();
    }
    function hideFormproperly()
    {
        $("#align-payment-form").hide();
    }
});


