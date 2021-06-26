import { useCallback, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Button,
    Col,
    Container,
    Form,
    InputGroup,
    Spinner,
    Toast,
} from 'react-bootstrap';
import axios from 'axios';

const baseState = {
    precio: 0,
};

const superFetch = async (...options) => {
    const res = await fetch(...options);
    const data = await res.json();
    return data;
};

function App() {
    const [state, setState] = useState({ ...baseState });
    const [show, setShow] = useState(false);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

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
                setState({});
                e.currentTarget.reset();
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
            <Form onSubmit={submit}>
                <Form.Group>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        onChange={changeValue}
                        name="nombre"
                        type="text"
                    ></Form.Control>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Notas</Form.Label>
                    <Form.Control
                        onChange={changeValue}
                        name="notas"
                        type="text"
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
                                    type="number"
                                    className="text-right"
                                    inputmode="decimal"
                                    pattern="[0-9]*"
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
                                type="file"
                                accept="image/*"
                                capture="camera"
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>

                <Button
                    variant="primary"
                    type="submit"
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
        </Container>
    );
}

export default App;
