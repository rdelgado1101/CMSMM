// Parámetros del aplicativo
//var ServicesURL = "http://190.41.40.187:55000/rest/";
//var ServicesURL = "https://www.coopsantamariaenlinea.com.pe/rest/";
var ServicesURL = "http://10.0.3.2:8080/ConsultasWeb/rest/";

// Métodos a ejecutarse al levantar la página
// $('#notifications').live('pageshow', function () {
//     app.getLatestNotifications();
// });

var app = {
	setPIN: function(caracter){
		var strPIN = $("#txtPIN").val();
		strPIN += caracter;
		$("#txtPIN").val(strPIN);
		if(strPIN.length === 6){
			app.login();
		}
	},
	limpiarPIN: function(){
		$("#txtPIN").val('');
	},
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        // Device ready
        // app.receivedEvent('deviceready');

        // Fastclick
        FastClick.attach(document.body);

        // Obtener data
        // app.bindData();
    },
    // receivedEvent: function (id) {
        //
    // },
    // bindData: function () {
		
    // },
    login: function () {
        // Recuperar data del formulario
        var strNroTarjeta = $('#txtNroTarjeta').val();
        var strPin = $('#txtPIN').val();
		
		if(strNroTarjeta == ''){
			alert("Ingrese Tarjeta");
			$('#txtNroTarjeta').focus();
			return false;
		}
		if(strPin == ''){
			alert("Ingrese PIN");
			$('#txtPIN').focus();
			return false;
		}
		
        // Limpiar mensaje de login
        $('#lblLoginMessage').empty();
        $('#lblLoginMessage').hide();

        // Mostrar mensaje de carga
        app.showLoadingMessage("Autenticando...");
        if (app.checkConnection != 0) {
            $.ajax({
                url: ServicesURL + "login",
                dataType: "jsonp",
                type: "GET",
                data: { nroTarjeta: strNroTarjeta, pin: strPin, token: 'a671gjkdb56skgs1db6g', callback: 'login' },
                crossDomain: true,
                timeout: 10000,
                async: false,
                success: function (data) {
					console.log(data);
					//alert(data);
                    if (data != null) {
                        app.hideLoadingMessage();
						if(data.mensaje != null){
							alert(data.codigo + " : " + data.mensaje);
							$('#txtPIN').val("");
							//app.vibrate();
						}else{
							$("#hdfCodigo").val(data.Codigo);//obtener del login
							//$("#hdfNombreUsuario").val(data.Nomres);
							$("#lblNombreUsuario").html(data.Nombres);
							$("#hdfToken").val(data.token);

							$('#menu').show();
							
							$('#txtNroTarjeta').val("88019800");
							$('#txtPIN').val("");
							$('#lblLoginMessage').hide();
							
							app.mostrarCuentas();
						}
                    }
                    else if (data == null) {
                        // Ocultar mensaje de carga
                        app.hideLoadingMessage();
                        app.vibrate();
                    }
                },
                failure: function (data) {
					alert(data);
                    app.vibrate();

                    // Ocultar mensaje de carga
                    app.hideLoadingMessage();
                },
                error: function(xhr, status, error){
					alert(xhr);
                    app.vibrate();

                    // Ocultar mensaje de carga
                    app.hideLoadingMessage();
                }
            });
        }
    },
	mostrarCuentas: function(){
		var strCodigo = $("#hdfCodigo").val();
		var strToken = $("#hdfToken").val();
		$("#tbCuentasAhorro").empty();
		// Ir a la pagina de home
		$.mobile.changePage("#home", {transition: "fade", reverse: false, changeHash: false});
        app.showLoadingMessage("Obteniendo cuentas...");
		$.ajax({
			url: ServicesURL + "ahorros",
			dataType: "jsonp",
			type: "GET",
			data: { codigo: strCodigo, token: strToken, callback: 'ahorros' },
			crossDomain: true,
			timeout: 10000,
			async: false,
			success: function (data) {
				//alert(data);
				console.log(data);
				var strRegistros = '';
				if (data != null) {
					if(data.mensaje != null){
						app.hideLoadingMessage();
						alert(data.codigo + " : " + data.mensaje);
						//app.vibrate();
					}else{
						// Ocultar mensaje de carga
						try{
							if(isNaN(data.cuentas.length)){
								strRegistros = strRegistros + '<tr style="font-size:10px">'; 
								strRegistros = strRegistros + '<td><a  style="font-size:9px" href="#" onclick="app.verMovimientosAhorros(' +  data.cuentas.IdAhorro + ')">' + data.cuentas.Descripcion + '</a></td>'; 
								strRegistros = strRegistros + '<td>' + data.cuentas.Saldo + '</td>'; 
								strRegistros = strRegistros + '<td>' + data.cuentas.Moneda + '</td>'; 
								//strRegistros = strRegistros + '<td><a style="font-size:9px" href="#" onclick="app.verMovimientosAhorros(' +  data.cuentas.IdAhorro + ')">Ver</a></td>'; 
								strRegistros = strRegistros + '</tr>'; 
							}else{						
								$.each(data.cuentas, function (index, item) {
									strRegistros = strRegistros + '<tr style="font-size:10px">'; 
									strRegistros = strRegistros + '<td><a style="font-size:9px" href="#" onclick="app.verMovimientosAhorros(' +  item.IdAhorro + ')">' + item.Descripcion + '</a></td>'; 
									strRegistros = strRegistros + '<td>' + item.Saldo + '</td>'; 
									strRegistros = strRegistros + '<td>' + item.Moneda + '</td>'; 
									//strRegistros = strRegistros + '<td><a style="font-size:9px" href="#" onclick="app.verMovimientosAhorros(' +  item.IdAhorro + ')">Ver</a></td>'; 
									strRegistros = strRegistros + '</tr>'; 
								});
							}
						}catch(err){
							app.hideLoadingMessage();
						}
					}
					app.hideLoadingMessage();
					$("#tbCuentasAhorro").append(strRegistros);
				}
				else if (data == null) {
					// Ocultar mensaje de carga
					app.hideLoadingMessage();
					app.vibrate();
				}
				app.hideLoadingMessage();
			},
			failure: function (data) {
				app.vibrate();

				// Ocultar mensaje de carga
				app.hideLoadingMessage();
			}
		});
	},
	verMovimientosAhorros: function(IdAhorro){
		var strCodigo = $("#hdfCodigo").val();
		var strToken = $("#hdfToken").val();
		$("#tbMovimientosAhorro").empty();
		$.mobile.changePage("#movimientosAhorro", {transition: "fade",reverse: false,changeHash: false});
		
        app.showLoadingMessage("Obteniendo movimientos...");
		
		$.ajax({
			url: ServicesURL + "movimientosahorros",
			dataType: "jsonp",
			type: "GET",
			data: { idtercero: strCodigo, token: strToken, idahorro: IdAhorro, callback: 'mov' },
			crossDomain: true,
			timeout: 10000,
			async: false,
			success: function (data) {
				//alert(data);
				console.log(data);
				if (data != null) {
					if(data.mensaje != null){
						app.hideLoadingMessage();
						alert(data.codigo + " : " + data.mensaje);
						//app.vibrate();
					}else{
						// Ocultar mensaje de carga
						var strRegistros = '';
						try{
							if(isNaN(data.prestamos.length)){
								strRegistros = strRegistros + '<tr style="font-size:10px">'; 
								strRegistros = strRegistros + '<td>' + app.formatearFecha(data.prestamos.Fecha) + '</td>'; 
								strRegistros = strRegistros + '<td>' + data.prestamos.Descripcion + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.prestamos.Monto * 1.0).toFixed(2) + '</td>';
								strRegistros = strRegistros + '</tr>'; 
							}else{
								$.each(data.prestamos, function (index, item) {
									strRegistros = strRegistros + '<tr style="font-size:10px">'; 
									strRegistros = strRegistros + '<td>' + app.formatearFecha(item.Fecha) + '</td>'; 
									strRegistros = strRegistros + '<td>' + item.Descripcion + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Monto * 1.0).toFixed(2) + '</td>';
									strRegistros = strRegistros + '</tr>'; 
								});
							}
						}catch (err){
							
						}
						app.hideLoadingMessage();
						$("#tbMovimientosAhorro").append(strRegistros);
					}
				}
				else if (data == null) {
					// Ocultar mensaje de carga
					app.hideLoadingMessage();
					app.vibrate();
				}
			},
			failure: function (data) {
				$('#lblLoginMessage').append("Lo sentimos, ha ocurrido un error.");
				$('#lblLoginMessage').show();
				app.vibrate();

				// Ocultar mensaje de carga
				app.hideLoadingMessage();
			}
		});
	},	//brenda, 
	mostrarPrestamos: function(){
		var strCodigo = $("#hdfCodigo").val();
		var strToken = $("#hdfToken").val();
		$("#tbPrestamos").empty();
		// Ir a la pagina de home
		$.mobile.changePage("#prestamos", {transition: "fade", reverse: false, changeHash: false});
        app.showLoadingMessage("Obteniendo préstamos...");
		$.ajax({
			url: ServicesURL + "prestamos",
			dataType: "jsonp",
			type: "GET",
			data: { codigo: strCodigo, token: strToken, callback: 'prestamos' },
			crossDomain: true,
			timeout: 10000,
			async: false,
			success: function (data) {
				//alert(data);
				console.log(data);				
				if (data != null) {
					if(data.mensaje != null){
						app.hideLoadingMessage();
						alert(data.codigo + " : " + data.mensaje);
						//app.vibrate();
					}else{
						// Ocultar mensaje de carga
						var strRegistros = '';
						try{
							if(isNaN(data.prestamos.length)){
								strRegistros = strRegistros + '<tr style="font-size:10px">'; 
								strRegistros = strRegistros + '<td style="font-size:9px">' + data.prestamos.Descripcion + '</td>'; 
								strRegistros = strRegistros + '<td style="font-size:9px">' + (data.prestamos.Saldo * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td style="font-size:9px">' + data.prestamos.Moneda + '</td>'; 
								strRegistros = strRegistros + '<td><a style="font-size:9px" href="#" onclick="app.verPagosPrestamo(' +  data.prestamos.IdPrestamo + ')">Pagos</a></td>'; 
								strRegistros = strRegistros + '<td><a style="font-size:9px" href="#" onclick="app.verCuotasPrestamo(' +  data.prestamos.IdPrestamo + ')">Cuotas</a></td>'; 
								strRegistros = strRegistros + '</tr>'; 
							}else{
								$.each(data.prestamos, function (index, item) {
									strRegistros = strRegistros + '<tr style="font-size:10px">'; 
									strRegistros = strRegistros + '<td style="font-size:9px">' + item.Descripcion + '</td>'; 
									strRegistros = strRegistros + '<td style="font-size:9px">' + (item.Saldo * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td style="font-size:9px">' + item.Moneda + '</td>'; 
									strRegistros = strRegistros + '<td><a style="font-size:9px" href="#" onclick="app.verPagosPrestamo(' +  item.IdPrestamo + ')">Pagos</a></td>'; 
									strRegistros = strRegistros + '<td><a style="font-size:9px" href="#" onclick="app.verCuotasPrestamo(' +  item.IdPrestamo + ')">Cuotas</a></td>'; 
									strRegistros = strRegistros + '</tr>'; 
								});
							}
						}catch(err){
						
						}
						app.hideLoadingMessage();
						$("#tbPrestamos").append(strRegistros);
					}
				}
				else if (data == null) {
					// Ocultar mensaje de carga
					app.hideLoadingMessage();
					app.vibrate();
				}
				app.hideLoadingMessage();
			},
			failure: function (data) {
				app.vibrate();

				// Ocultar mensaje de carga
				app.hideLoadingMessage();
			}
		});
	},
	verPagosPrestamo: function(IdPrestamo){
		var strCodigo = $("#hdfCodigo").val();
		var strToken = $("#hdfToken").val();
		$("#tbPagosPrestamo").empty();
		// Ir a la pagina de home
		$.mobile.changePage("#pagosprestamo", {transition: "fade", reverse: false, changeHash: false});
        app.showLoadingMessage("Obteniendo pagos...");
		$.ajax({
			url: ServicesURL + "movimientosprestamos/pagos",
			dataType: "jsonp",
			type: "GET",
			data: { idprestamo: IdPrestamo, token: strToken, callback: 'pagos' },
			crossDomain: true,
			timeout: 10000,
			async: false,
			success: function (data) {
				//alert(data);
				console.log(data);
				if (data != null) {
					if(data.mensaje != null){
						app.hideLoadingMessage();		
						alert(data.codigo + " : " + data.mensaje);				
						//app.vibrate();
					}else{
						// Ocultar mensaje de carga
						var strRegistros = '';
						try{
							if(isNaN(data.prestamos.length)){
								strRegistros = strRegistros + '<tr style="font-size:10px">'; 
								strRegistros = strRegistros + '<td>' + app.formatearFecha(data.prestamos.Fecha) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.prestamos.Capital * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.prestamos.Cuota * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.prestamos.Interes * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.prestamos.Mora * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.prestamos.Cargo * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.prestamos.Total * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '</tr>'; 
							}else{
								$.each(data.prestamos, function (index, item) {
									strRegistros = strRegistros + '<tr style="font-size:10px">'; 
									strRegistros = strRegistros + '<td>' + app.formatearFecha(item.Fecha) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Capital * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Cuota * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Interes * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Mora * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Cargo * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Total * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '</tr>'; 
								});
							}
						}catch(err){
							
						}
						app.hideLoadingMessage();
						$("#tbPagosPrestamo").append(strRegistros);
					}
				}
				else if (data == null) {
					// Ocultar mensaje de carga
					app.hideLoadingMessage();
					app.vibrate();
				}
				app.hideLoadingMessage();
			},
			failure: function (data) {
				app.vibrate();

				// Ocultar mensaje de carga
				app.hideLoadingMessage();
			}
		});
	},
	verCuotasPrestamo: function(IdPrestamo){
		var strCodigo = $("#hdfCodigo").val();
		var strToken = $("#hdfToken").val();
		$("#tbCuotasPrestamo").empty();
		// Ir a la pagina de home
		$.mobile.changePage("#cuotasprestamo", {transition: "fade", reverse: false, changeHash: false});
        app.showLoadingMessage("Obteniendo cuotas...");
		$.ajax({
			url: ServicesURL + "movimientosprestamos/cuotas",
			dataType: "jsonp",
			type: "GET",
			data: { idprestamo: IdPrestamo, token: strToken, callback: 'cuotas' },
			crossDomain: true,
			timeout: 10000,
			async: false,
			success: function (data) {
				//alert(data);
				console.log(data);
				if (data != null) {
					if(data.mensaje != null){
						app.hideLoadingMessage();
						alert(data.codigo + " : " + data.mensaje);
						//app.vibrate();
					}else{
					
						// Ocultar mensaje de carga
						var strRegistros = '';
						try{
							if(isNaN(data.cuotapendiente.length)){
								strRegistros = strRegistros + '<tr style="font-size:10px">'; 
								strRegistros = strRegistros + '<td>' + app.formatearFecha(data.cuotapendiente.Fecha) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.cuotapendiente.Capital * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.cuotapendiente.Cuota * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.cuotapendiente.Interes * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.cuotapendiente.Mora * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.cuotapendiente.Cargo * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '<td>' + (data.cuotapendiente.Total * 1.0).toFixed(2) + '</td>'; 
								strRegistros = strRegistros + '</tr>'; 
							}else{
								$.each(data.cuotapendiente, function (index, item) {
									strRegistros = strRegistros + '<tr style="font-size:10px">'; 
									strRegistros = strRegistros + '<td>' + app.formatearFecha(item.Fecha) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Capital * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Cuota * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Interes * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Mora * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Cargo * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Total * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '</tr>'; 
								});
							}
						}catch(err){
						
						}
						app.hideLoadingMessage();
						$("#tbCuotasPrestamo").append(strRegistros);
					}
				}
				else if (data == null) {
					// Ocultar mensaje de carga
					app.hideLoadingMessage();
					app.vibrate();
				}
				app.hideLoadingMessage();
			},
			failure: function (data) {
				app.vibrate();

				// Ocultar mensaje de carga
				app.hideLoadingMessage();
			}
		});
	},
	mostrarFPS: function(){
		var strCodigo = $("#hdfCodigo").val();
		var strToken = $("#hdfToken").val();
		$("#tbFPS").empty();
		// Ir a la pagina de home
		$.mobile.changePage("#fps", {transition: "fade", reverse: false, changeHash: false});
        app.showLoadingMessage("Obteniendo FPS...");
		$.ajax({
			url: ServicesURL + "listarfps",
			dataType: "jsonp",
			type: "GET",
			data: { idtercero: strCodigo, token: strToken, callback: 'fps' },
			crossDomain: true,
			timeout: 10000,
			async: false,
			success: function (data) {
				//alert(data);
				console.log(data);
				if (data != null) {		
					if(data.mensaje != null){
						app.hideLoadingMessage();
						alert(data.codigo + " : " + data.mensaje);
						//app.vibrate();
					}else{
						var strRegistros = '';		
						try{
							if(isNaN(data.prestamos.length)){
								strRegistros = strRegistros + '<tr style="font-size:10px">';
								strRegistros = strRegistros + '<td>' + app.formatearFecha(data.prestamos.Fecha) + '</td>';
								strRegistros = strRegistros + '<td>' + (data.prestamos.Monto * 1.0).toFixed(2) + '</td>';
								strRegistros = strRegistros + '<td>' + data.prestamos.Voucher + '</td>';
								strRegistros = strRegistros + '</tr>';
							}else{
								$.each(data.prestamos, function (index, item) {
									strRegistros = strRegistros + '<tr style="font-size:10px">'; 
									strRegistros = strRegistros + '<td>' + app.formatearFecha(item.Fecha) + '</td>'; 
									strRegistros = strRegistros + '<td>' + (item.Monto * 1.0).toFixed(2) + '</td>'; 
									strRegistros = strRegistros + '<td>' + item.Voucher + '</td>';
									strRegistros = strRegistros + '</tr>'; 
								});
							}
						}catch (err){
						}
						
						// Ocultar mensaje de carga
						app.hideLoadingMessage();
						$("#tbFPS").append(strRegistros);
					}
				}
				else if (data == null) {
					// Ocultar mensaje de carga
					app.hideLoadingMessage();
					app.vibrate();
				}				
				app.hideLoadingMessage();
			},
			failure: function (data) {
				app.vibrate();
				// Ocultar mensaje de carga
				app.hideLoadingMessage();
			}
		});
	},
    checkConnection: function () {
        var result = navigator.connection.type == Connection.NONE ? 0 : 1;
        if (result == 0) {
            app.showNotificationVibrate('Para continuar, por favor, conéctese a internet.');
            return 0;
        }
        else return 1;
    },
    vibrate: function () {
        navigator.notification.vibrate(1000);
    },
    showLoadingMessage: function (strMessage) {
        $.mobile.loadingMessage = strMessage;
        $("body").append('<div class="modalWindow"/>');
        $.mobile.showPageLoadingMsg();
    },
    hideLoadingMessage: function () {
        $(".modalWindow").remove();
        $.mobile.hidePageLoadingMsg();
    },
    showErrorMessage: function () {
        app.showNotificationVibrate("Lo sentimos, ha ocurrido un error.");
    },
    formatearFecha: function(strFecha){
		var arrFecha = strFecha.split('-');
		return (arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]);
    }	
};