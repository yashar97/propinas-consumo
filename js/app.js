//variables
const btnCerrarModal = document.getElementById('guardar-cliente');
const contenido = document.querySelector('#resumen .contenido');
let cliente;
const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

//eventos
btnCerrarModal.addEventListener('click', reservarMesa);

//funciones
async function reservarMesa() {
    const mesa = document.getElementById('mesa').value;
    const hora = document.getElementById('hora').value;

    //instancia del modal
    const formulario = document.getElementById('formulario');
    const modal = bootstrap.Modal.getInstance(formulario);
    modal.hide();

    //mostramos las secciones ocultas
    document.getElementById('platillos').classList.remove('d-none');
    document.getElementById('resumen').classList.remove('d-none');

    cliente = {
        mesa,
        hora,
        pedidos: []
    }

    //obtener los platillos con fetch
    const promise = await fetch('../db/db.json');
    const platos = await promise.json();
    imprimirPlatillos(platos.platillos);
}

function imprimirPlatillos(platos) {
    platos.forEach(platillo => {

        const row = document.createElement('div');
        row.classList.add('row', 'm-2');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('input');
        inputCantidad.classList.add('form-control');
        inputCantidad.id = `input-${platillo.id}`;
        inputCantidad.type = 'number';
        inputCantidad.value = 0;
        inputCantidad.min = 0;
        inputCantidad.onchange = () => {
            agregarPlatillo({ ...platillo, cantidad: parseInt(inputCantidad.value) });
        }

        const divInput = document.createElement('divInput');
        divInput.classList.add('col-md-2');
        divInput.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(divInput);

        document.querySelector('#platillos .contenido').appendChild(row);
    });
}

function agregarPlatillo(platillo) {

    if (platillo.cantidad > 0) {
        const existe = cliente.pedidos.find(el => el.id === platillo.id);
        if (existe) {
            existe.cantidad = platillo.cantidad;
        } else {
            cliente.pedidos.push(platillo);
        }
    } else {
        const restoPedidos = cliente.pedidos.filter(el => el.id !== platillo.id);
        cliente.pedidos = [...restoPedidos];
    }

    imprimirResumen();

}

function imprimirResumen() {

    if (cliente.pedidos.length) {
        limpiarHTML();

        const resumenPedidosContainer = document.createElement('div');
        resumenPedidosContainer.classList.add('col-md-6', 'productos-container');

        //informacion de la mesa
        const mesa = document.createElement('p');
        mesa.classList.add('fw-bold');
        mesa.textContent = `Mesa: ${cliente.mesa}`;

        //informacion de la hora
        const hora = document.createElement('p');
        hora.classList.add('fw-bold');
        hora.textContent = `Hora: ${cliente.hora}`;

        resumenPedidosContainer.appendChild(mesa);
        resumenPedidosContainer.appendChild(hora);

        cliente.pedidos.forEach(element => {
            //por cada elemento en el array creamos un div
            const platilloContainer = document.createElement('div');
            platilloContainer.classList.add('info-platillo');
            //nombre del platillo
            const nombre = document.createElement('h4');
            nombre.textContent = element.nombre;

            const precio = document.createElement('p');
            precio.textContent = `Precio: $${element.precio}`;

            const cantidad = document.createElement('p');
            cantidad.textContent = `Cantidad: ${element.cantidad}`;

            const subtotal = document.createElement('p');
            subtotal.textContent = `Subtotal: $${calcularSubtotal(element.id)}`;

            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('btn', 'btn-danger');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.onclick = () => {
                eliminarPlatillo(element.id);
            }


            platilloContainer.appendChild(nombre);
            platilloContainer.appendChild(precio);
            platilloContainer.appendChild(cantidad);
            platilloContainer.appendChild(subtotal);
            platilloContainer.appendChild(btnEliminar);
            resumenPedidosContainer.appendChild(platilloContainer);

        });


        contenido.appendChild(resumenPedidosContainer);

        formularioPropina();

        //seccion propinas
        const propinas = document.querySelector('.div-totales');
        
        const totalAhora = document.createElement('h5');
        totalAhora.classList.add('total');
        totalAhora.textContent = `Total: $${imprimirTotal()}`;

        const propinasAhora = document.createElement('h5');
        propinasAhora.classList.add('propinas-ahora');
        propinasAhora.textContent = `Propina: $`;

        const totalSinPropina = document.createElement('h5');
        totalSinPropina.classList.add('total-sin-propina');
        totalSinPropina.textContent = `Subtotal: $${calcularSinPropina()}`;
        
        propinas.appendChild(propinasAhora);
        propinas.appendChild(totalSinPropina);
        propinas.appendChild(totalAhora);

        return;
    }

    limpiarHTML();

    const mensaje = document.createElement('p');
    mensaje.classList.add('text-center');
    mensaje.textContent = 'Añade los elementos del pedido';
    contenido.appendChild(mensaje);

}

function calcularSinPropina() {
    return cliente.pedidos.reduce((acc, element) => acc + (element.cantidad * element.precio), 0);
}

function imprimirTotal() {
    return cliente.pedidos.reduce((acc, element) => acc + (element.cantidad * element.precio), 0);
}

function formularioPropina() {
    const divPropinas = document.createElement('div');
    divPropinas.classList.add('col-md-6', 'propinas');

    //contendor de las opciones de propinas
    const formPropinas = document.createElement('form');
    formPropinas.classList.add('form');

    //input 10%
    const input10 = document.createElement('input');
    input10.name = 'propina';
    input10.type = 'radio';
    input10.value = 10;
    input10.onclick = calcularPropina;

    //label 10%
    const label10 = document.createElement('label');
    label10.textContent = '10%';

    //div 10%
    const div10 = document.createElement('div');
    div10.appendChild(input10);
    div10.appendChild(label10);

    //input 15%
    const input15 = document.createElement('input');
    input15.name = 'propina';
    input15.type = 'radio';
    input15.value = 15;
    input15.onclick = calcularPropina;

    //label 15%
    const label15 = document.createElement('label');
    label15.textContent = '15%';

    //div 15%
    const div15 = document.createElement('div');
    div15.appendChild(input15);
    div15.appendChild(label15);

    //input 30%
    const input30 = document.createElement('input');
    input30.name = 'propina';
    input30.type = 'radio';
    input30.value = 30;
    input30.onclick = calcularPropina;

    //label 30%
    const label30 = document.createElement('label');
    label30.textContent = '30%';

    //div 30%
    const div30 = document.createElement('div');
    div30.appendChild(input30);
    div30.appendChild(label30);

    formPropinas.appendChild(div10);
    formPropinas.appendChild(div15);
    formPropinas.appendChild(div30);

    divPropinas.appendChild(formPropinas);

    //contenedor para el resultado de las propinas y el total
    const totalesContainer = document.createElement('div');
    totalesContainer.classList.add('div-totales', 'col-md-6');

    
    divPropinas.appendChild(totalesContainer);
    contenido.appendChild(divPropinas);
}

function calcularPropina() {
    const porcentaje = parseInt(document.querySelector('[name="propina"]:checked').value);

    //total consumido
    const total = cliente.pedidos.reduce((acc, element) => acc + (element.cantidad * element.precio), 0);

    //total propina
    const totalPropina = (total * porcentaje) / 100;

    //total a pagar
    const totalAPagar = total + totalPropina;

    //imprimir
    const prop = document.querySelector('.propinas-ahora');
    const totalFinal = document.querySelector('.total');

    prop.textContent = `Propina: $${totalPropina}`;
    totalFinal.textContent = `Total: $${totalAPagar}`;
    
}

function imprimirTotales(consumo, propina, total) {

    const contenedor = document.querySelector('.div-totales');

    contenedor.innerHTML = "";

    const consumido = document.createElement('h6');
    consumido.textContent = `Total Consumo: $${consumo}`;

    const propinas = document.createElement('h6');
    propinas.textContent = `Propina: $${propina}`;

    const totalFinal = document.createElement('h6');
    totalFinal.textContent = `Total a pagar: $${total}`;

    contenedor.appendChild(consumido);
    contenedor.appendChild(propinas);
    contenedor.appendChild(totalFinal);
}

function limpiarHTML() {
    contenido.innerHTML = "";
}

function calcularSubtotal(id) {
    const producto = cliente.pedidos.find(element => element.id === id);

    return producto.cantidad * producto.precio;
}

function eliminarPlatillo(id) {
    const resultado = cliente.pedidos.filter(element => element.id !== id);

    cliente.pedidos = [...resultado];

    imprimirResumen();

    const input = document.getElementById(`input-${id}`);

    input.value = 0;

}