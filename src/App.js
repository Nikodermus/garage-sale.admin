import { useCallback, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Button,
    Col,
    Container,
    Form,
    InputGroup,
    Modal,
    Spinner,
    Toast,
} from 'react-bootstrap';
import axios from 'axios';

const superFetch = async (...options) => {
    const res = await fetch(...options);
    const data = await res.json();
    return data;
};

const baseState = {
    nombre: '',
    precio: '',
    foto: '',
    notas: '',
};

function App() {
    const [state, setState] = useState({ ...baseState });
    const [show, setShow] = useState(false);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const [isOpen, setOpen] = useState(false);
    const [building, setBuilding] = useState(false);

    const changeValue = (e) =>
        setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const submit = useCallback(
        async (e) => {
            e.preventDefault();

            setLoading(true);

            try {
                const img = new FormData();
                img.append('image', state.foto);

                const { data } = await superFetch(
                    `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API}`,
                    {
                        method: 'POST',
                        body: img,
                    }
                );

                await axios.post(process.env.REACT_APP_DB, {
                    ...state,
                    precio: state.precio * 1000,
                    foto: data.image.url,
                    estado: 'disponible',
                });

                setStatus('success');
                setState({ ...baseState });
            } catch (error) {
                setStatus('danger');
            }

            setShow(true);
            setLoading(false);
        },
        [state]
    );

    return (
        <Container className="pt-5">
            <style>
                {`input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}`}
            </style>
            <Form onSubmit={submit} autoComplete="off">
                <Form.Group>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        onChange={changeValue}
                        name="nombre"
                        autoComplete="false"
                        type="text"
                        value={state.nombre}
                    ></Form.Control>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Notas</Form.Label>
                    <Form.Control
                        onChange={changeValue}
                        name="notas"
                        autoComplete="false"
                        type="text"
                        value={state.notas}
                    ></Form.Control>
                </Form.Group>

                <Form.Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>Precio en miles</Form.Label>

                            <InputGroup>
                                <Form.Control
                                    onChange={changeValue}
                                    name="precio"
                                    autoComplete="false"
                                    type="number"
                                    className="text-right"
                                    inputMode="decimal"
                                    pattern="[0-9]*"
                                    value={state.precio}
                                ></Form.Control>
                                <InputGroup.Text>000</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>Foto</Form.Label>
                            <Form.Control
                                onChange={(e) =>
                                    setState((prev) => ({
                                        ...prev,
                                        foto: e.target.files[0],
                                    }))
                                }
                                name="foto"
                                autoComplete="false"
                                type="file"
                                accept="image/*"
                                capture="camera"
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>

                <Button
                    variant="primary"
                    autoComplete="false"
                    type="submit"
                    size="lg"
                    block
                    disabled={
                        !state.nombre || !state.foto || !state.precio || loading
                    }
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="grow"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />{' '}
                            Loading...
                        </>
                    ) : (
                        'Subir'
                    )}
                </Button>
            </Form>
            <br />
            <Toast
                onClose={() => setShow(false)}
                show={show}
                delay={3000}
                autohide
                bg={status}
                position="bottom right"
            >
                <Toast.Body>
                    {status === 'danger'
                        ? 'No funciono, trata de nuevo'
                        : 'Nuevo elemento agregado'}
                </Toast.Body>
            </Toast>
            <br />
            <Button variant="info" onClick={() => setOpen(true)}>
                Admin
            </Button>

            <Modal show={isOpen} onHide={() => setOpen(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reconstruir el sitio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Si necesitas actualizar el sitio, dale construir
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    {Math.random() + 1 && (
                        <img
                            src={`https://api.netlify.com/api/v1/badges/c9f315ae-08e5-4959-8b3d-9365be71649a/deploy-status?r=${Math.random()}`}
                            alt=""
                            style={{ marginRight: 'auto' }}
                        />
                    )}
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cerrar
                    </Button>
                    <Button
                        variant="primary"
                        disabled={building}
                        onClick={async () => {
                            setBuilding(true);

                            try {
                                await fetch(
                                    'https://api.netlify.com/build_hooks/60d6a55d004d545051b7c124',
                                    { method: 'POST' }
                                );
                            } catch (error) {}

                            setBuilding(false);
                        }}
                    >
                        {building ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />{' '}
                                Comenzando a construir...
                            </>
                        ) : (
                            'Contruir'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;
