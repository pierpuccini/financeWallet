import React from 'react'

import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'

import classes from './Message.module.scss'

const Message = props => {
    const {
        text,
        handleSubmit,
        isLoading,
        inputChangeHandler,
        textResponse,
        success,
        error,
    } = props

    let helperText = !text.text.valid
        ? 'Please enter message.'
        : success
        ? 'Message sent!'
        : error
        ? 'Message stuck.'
        : null

    return (
        <Container>
            <Row>
                <Col md={6}>
                    <Form noValidate validated={text.text.valid}>
                        <Form.Group className={classes.formGroup}>
                            <Form.Label className={classes.formLabel}>
                                Message
                            </Form.Label>
                            <Form.Control
                                required
                                as="textarea"
                                rows="5"
                                className={classes.formControl}
                                value={text.text.value}
                                onChange={event =>
                                    inputChangeHandler(event, 'text')
                                }
                            />
                            <div
                                className={
                                    success
                                        ? classes.success
                                        : error
                                        ? classes.error
                                        : !text.text.valid
                                        ? null
                                        : null
                                }
                            >
                                {helperText}
                            </div>
                        </Form.Group>
                    </Form>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!text.text.valid}
                        onClick={!isLoading ? handleSubmit : null}
                    >
                        {isLoading ? (
                            <Spinner
                                as="span"
                                animation="grow"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        ) : null}
                        {isLoading ? 'Loading…' : 'Submit'}
                    </Button>
                </Col>
                <Col md={6} className={classes.responseCol}>
                    <h6>Message Response API</h6>
                    <Card bg="light" className={classes.card}>
                        <Card.Body>
                            <Card.Text>{textResponse}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default Message
