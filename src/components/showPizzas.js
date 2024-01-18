
import ReactPaginate from 'react-paginate';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showAlert } from '../functions';

const ShowPizzas = () => {
  const url = 'http://localhost:3000/pizzas';
  const [pizzas, setPizzas] = useState([]);
  const [filtrarPizzas, setFiltrarPizzas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [piz_id, setId] = useState('');
  const [piz_name, setName] = useState('');
  const [piz_origin, setOrigin] = useState('');
  const [piz_state, setState] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(5); // default to 5

  const handlePageClick = (event) => {
    const newPage = event.selected;
    setCurrentPage(newPage);
  };

  useEffect(() => {
    getPizzas();
  }, []);

  useEffect(() => {
    const results = searchTerm
      ? pizzas.filter(pizza =>
        pizza.piz_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : pizzas;
    setFiltrarPizzas(results);
    setPageCount(Math.ceil(results.length / recordsPerPage)); // Calculate total pages
  }, [searchTerm, pizzas, recordsPerPage]);

  const getPizzas = async () => {
    try {
      const respuesta = await axios.get(url);
      console.log(respuesta.data); // Check what the API is returning
      setPizzas(respuesta.data);
    } catch (error) {
      console.error("Error fetching pizzas:", error);
    }
  };

  const openModal = (op, piz_id, piz_name, piz_origin, piz_state) => {
    setId('');
    setName('');
    setOrigin('');
    setState('');
    setOperation(op);
    if (op == 1) {
      setTitle('Registrar pizza');
    } else if (op == 2) {
      setTitle('Editar pizza');
      setId(piz_id);
      setName(piz_name);
      setOrigin(piz_origin);
      setState(piz_state);
    }
    window.setTimeout(function () {
      document.getElementById('piz_name').focus();

    }, 500);
  }
  const validar = () => {
    var parametros;
    var metodo;
    if (piz_name.trim() === '') {
      showAlert('Escribe el nombre de la pizza', 'warning');
    }
    else if (piz_origin.trim() === '') {
      showAlert('Escribe el origen de la pizza', 'warning');

    }
    else if (piz_state !== true && piz_state !== false) {
      showAlert('Escribe el estado de la pizza', 'warning');
    }
    else {
      if (operation === 1) {
        parametros = { name: piz_name.trim(), origin: piz_origin.trim(), state: piz_state };
        metodo = 'POST';
      }
      else {
        parametros = { id: piz_id, name: piz_name.trim(), origin: piz_origin.trim(), state: piz_state };
        metodo = 'PUT';
      }
      enviarSolicitud(metodo, parametros);
    }
  }
  const enviarSolicitud = async (metodo, parametros) => {
    await axios({ method: metodo, url: url, data: parametros }).then(function (respuesta) {
      var tipo = respuesta.data[0];
      var msj = respuesta.data[1];
      showAlert(msj, tipo);
      if (tipo === 'success') {
        document.getElementById('btnCerrar').click();
        getPizzas();
      }
    })
      .catch(function (error) {
        showAlert('Error en la solicitud', 'error');
        console.log(error);
      });
  }
  const deletePizza = (id, name) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro de eliminar el producto ${name}?`,
      icon: 'question',
      text: 'No se podrá dar marcha atrás',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setId(id);
        enviarSolicitud('DELETE', { piz_id: id });
      } else {
        showAlert('El producto NO fue eliminado', 'info');
      }
    });
  }
  console.log(Array.isArray(pizzas));

  return (
    <div className='App'>
      <div className='container-fluid'>
        <div className='row mb-3'>
          <div className='col-12'>
            <h2 className='text-center p-3'>Administración de Pizzas</h2>
          </div>
        </div>
        <div className='row mb-3'>
          <div className='col-lg-2 d-flex justify-content-start'>
            <button onClick={() => openModal(1)} className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalpizzas'>
              <i className='fa-solid fa-circle-plus'></i> Añadir
            </button>
          </div>
          <div className='col-lg-6'></div>
          <div className='col-lg-2 d-flex justify-content-end'>
            <input
              type='text'
              className='form-control w-auto'
              placeholder='Buscar pizza...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-12 col-lg-8 offset-0 offset-lg-2'>
            <div className='table-responsive'>
              <table className='table table-bordered'>
                <thead>
                  <tr><th>ID</th><th>NOMBRE</th><th>ORIGEN</th><th>ESTADO</th><th></th></tr>
                </thead>
                <tbody className='table-group-divider'>
                  {
                    filtrarPizzas
                      .slice(currentPage * recordsPerPage, (currentPage * recordsPerPage) + recordsPerPage) // Slice the data for the current page
                      .map((pizza, index) => (
                        <tr key={pizza.piz_id}>
                          <td>{(currentPage * recordsPerPage) + index + 1}</td>
                          <td>{pizza.piz_name}</td>
                          <td>{pizza.piz_origin}</td>
                          <td>{pizza.piz_state ? 'True' : 'False'}</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-12 d-flex justify-content-start align-items-end'>
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                {recordsPerPage ? `${recordsPerPage} Registros` : "Select Number"}
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li><a className="dropdown-item" href="#" onClick={() => setRecordsPerPage(5)}>5</a></li>
                <li><a className="dropdown-item" href="#" onClick={() => setRecordsPerPage(10)}>10</a></li>
                <li><a className="dropdown-item" href="#" onClick={() => setRecordsPerPage(15)}>15</a></li>
                <li><a className="dropdown-item" href="#" onClick={() => setRecordsPerPage(20)}>20</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-12 d-flex justify-content-center'>
            <ReactPaginate
              previousLabel={'Anterior'}
              nextLabel={'Siguiente'}
              breakLabel={'...'}
              pageCount={pageCount} // Set the dynamic page count
              onPageChange={handlePageClick}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              containerClassName={'pagination'} // Clase para el contenedor
              pageClassName={'page-item'} // Clase para cada página
              pageLinkClassName={'page-link'} // Clase para el enlace de cada página
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              breakClassName={'page-item'}
              breakLinkClassName={'page-link'}
              activeClassName={'active'} // Clase para la página activa
            />
          </div>
        </div>


      </div>
      <div id='modalpizzas' className='modal fade' aria-hidden='true'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <label className='h5'>{title}</label>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
            </div>
            <div className='modal-body'>
              <input type='hidden' id='piz_id'></input>
              <div className='input-group mb-3'>
                <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                <input type='text' id='piz_name' className='form-control' placeholder='Nombre' value={piz_name}
                  onChange={(e) => setName(e.target.value)}></input>
              </div>
              <div className='input-group mb-3'>
                <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                <input type='text' id='piz_origin' className='form-control' placeholder='Origen' value={piz_origin}
                  onChange={(e) => setOrigin(e.target.value)}></input>
              </div>
              <div className='input-group mb-3'>
                <span className='input-group-text'><i className='fa-solid fa-clipboard-question'></i></span>
                <select
                  id='piz_state'
                  className='form-control'
                  value={piz_state}
                  onChange={(e) => setState(e.target.value === 'true')}
                >
                  <option value="" disabled selected>- Seleccione el estado -</option> {/* Opción por defecto */}
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>

              <div className='d-grid col-6 mx-auto'>
                <button onClick={() => validar()} className='btn btn-success'>
                  <i className='fa-solid fa-floppy-disk'></i> Guardar
                </button>
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' id='btnCerrar' className='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPizzas