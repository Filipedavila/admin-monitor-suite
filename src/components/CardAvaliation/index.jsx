import React from 'react';
import PropTypes from 'prop-types';
import './CardAvaliation.css'; // Optional: Add styles in a separate CSS file
import { Button } from 'ama-design-system';
const CardAvaliation = ({ title, description }) => {
    return (
        <div className="bg-white p-5 d-flex flex-column justify-content-between card-avaliation">
            <h2>Estado das avaliações</h2>
            <h3>{title}</h3>
            <p>{description}</p>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias eius officiis blanditiis sed perspiciatis sint, necessitatibus magnam ab quod ex adipisci corrupti aut exercitationem sunt vero voluptatem, quibusdam, vel repellendus?</p>

<div className="d-flex gap-3">

            <Button
                text="Reiniciar"
                className="mt-3"
                variant="primary"
                onClick={() => alert('Avaliação iniciada!')}
            />

            <Button
                text="Apagar"
                className="mt-3"
                variant="danger"
                onClick={() => alert('Avaliação cancelada!')}
            />
</div>
        </div>
    );
};
CardAvaliation.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

export default CardAvaliation;