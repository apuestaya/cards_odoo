
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
            var data = {"params": {partner_id:partner_id,acquirer_id:acquirer_id}}
            $.ajax(
                {
                    type: "POST",
                    url:'/alignet/get_sale_order',            
                    data:JSON.stringify(data),            
                    dataType: 'json',    
                    contentType: "application/json",        
                    async: false,  
                    success: function (response)            
                    {            
                        response = response.result;
                        if(response.acquirer=="Alignet")                   
                        {
                         initFormAlignet(response);
                         displayFormproperly();   
                        }
                        else
                        {
                              $("#o_payment_form_pay").click();
                        }
                    }            
                });

               /* rpc.query({
                    model:'sale.order',
                    method:'get_sale_order',
                    args:[{partner_id:partner_id,acquirer_id:acquirer_id}],
                }).then(function (result) s
                    { 
                        alert("in")   
                        if(result.acquirer=="Alignet")                   
                        {
                         initFormAlignet(result);
                         displayFormproperly();   
                        }
                        else
                        {
                            $("#o_payment_form_pay").click();
                        }
                        
                    });*/
        });

        $(document).on("click",".hideFormproperly",function(event)
        {
            hideFormproperly();  
        });
        
        
    });
      
    function initFormAlignet(dataOrder)
    {
        PF.Init.execute(
            {
                data: 
                {
                        operation:  {
                                        operationNumber: dataOrder.order_name,
                                        amount: (dataOrder.amount),
                                        currency: {
                                        code: dataOrder.currency_code,
                                        symbol: dataOrder.currency_symbol+"."
                                    },
                        productDescription: 'Pago pedido '+ dataOrder.order_name
                        },
                        customer:   {
                                        name: dataOrder.name,
                                        lastname: dataOrder.name,
                                        email: dataOrder.email,
                                        address: dataOrder.address,
                                        zip: dataOrder.zip,
                                        city: dataOrder.city,
                                        state: dataOrder.state,
                                        country: dataOrder.country_name,
                                        phone: dataOrder.phone
                                    },
                        signature: dataOrder.signature
                },
                listeners: {
                            afterPay: function(response) 
                                {
                                    console.log(response)
                                    if(response.messageCode=="00")
                                    {
                                        var dataParams = {"params": {order_name:dataOrder.order_name_odoo,confirmation_date:dataOrder.date_order,order_id:dataOrder.order_id,acquirer_name:dataOrder.acquirer,"status":"paid"}}
                                        $.ajax(
                                            {
                                                type: "POST",
                                                url:'/alignet/update_order_status',            
                                                data:JSON.stringify(dataParams),            
                                                dataType: 'json',    
                                                contentType: "application/json",        
                                                async: false,  
                                                success: function (response)            
                                                {     
                                                    //alert("update_order_status")       
                                                    $("#o_payment_form_pay").click(); 
                                                }            
                                            });
                                            
                                        /*rpc.query({
                                            model:'sale.order',
                                            method:'update_order_status',
                                            args:[{order_name:data.order_name_odoo,confirmation_date:data.date_order,order_id:data.order_id,acquirer_name:data.acquirer,"status":"paid"}],
                                        }).then(function (result) 
                                            {
                                                $("#o_payment_form_pay").click(); 
                                            });*/
                                        
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
                                    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1yrmib8PShirgFjIBtSpU5N1Y\n'+
                                    'YrOCYxp9hxs325DySSj8Ol3IKqZlDMTtu64wFAGUQWr2rXi4Jg09kzeE3BlLff2K\n'+
                                    'hFdQOQINnhRv3bj3lySMTEN5abk7YdNJE1051NOFW0WrgTKr4X6n5kTworSydhCk\n'+
                                    'ADYLEoTk6YR3dOQJ2QIDAQAB\n'+
                                    '-----END PUBLIC KEY-----',
                                    locale: dataOrder.language,
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


