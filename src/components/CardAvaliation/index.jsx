import React from 'react';
import PropTypes from 'prop-types';
import './CardAvaliation.css'; // Optional: Add styles in a separate CSS file
import { Button } from 'ama-design-system';
const CardAvaliation = ({ title, description, darkTheme }) => {
    return (
        <div className="d-flex flex-column justify-content-between p-4 card-avaliation">
            <h3 className="mb-3">{title}</h3>
            <span className="text-start mb-3">{description}</span>
            
            <ul className="list-unstyled">
                <li>Total de avaliações desde 28/09/2021: 4000000</li>
                <li>Nº de páginas em avaliação no momento: 40</li>
                <li>Nº de páginas em fila de espera para avaliar: 80</li>
                <li>Nº de páginas sem avaliação devido a erro: 4</li>
            </ul>

<div className="d-flex gap-3">

            <Button
                darkTheme={darkTheme}
                text="Reiniciar"
                className="mt-3"
                variant="primary"
                onClick={() => alert('Avaliação iniciada!')}
            />

            <Button
                darkTheme={darkTheme}
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