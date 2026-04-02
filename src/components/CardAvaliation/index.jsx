import React from 'react';
import PropTypes from 'prop-types';
import './CardAvaliation.css'; // Optional: Add styles in a separate CSS file
import { Button } from "@a12e/accessmonitor-ds";
import { Link } from 'react-router-dom';
import moment from 'moment';
const CardAvaliation = ({ title, description, darkTheme, data, handleReset, handleCancel, hasNoButtons }) => {
    return (
        <div className="d-flex flex-column justify-content-between p-4 card-avaliation">
            <h3 className="mb-3">{title}</h3>
            <span className="text-start mb-3">{description}</span>
            
            <ul className="list-unstyled">
                <li>Total de avaliações desde {moment(data.date).format('DD/MM/YYYY')}: {data.counter}</li>
              {title !== "AccessMonitor" && (
                <>
                  <li>Nº de páginas em avaliação no momento: {data.evaluating}</li>
                  <li>Nº de páginas em fila de espera para avaliar: {data.waiting}</li>
                  <li>Nº de páginas sem avaliação devido a erro:  {<Link to={`/dashboard/evaluation-with-errors/${title.includes("AdminMonitorSuite") ? "AMS" : "MM"}`}> {data.error} </Link>}</li>
                </>
              )}
            </ul>

<div className="d-flex gap-3">
{!hasNoButtons && (
            <Button
                darkTheme={darkTheme}
                text="Reiniciar"
                className="mt-3"
                variant="primary"
                onClick={handleReset}
            />
)}
{!hasNoButtons && ( 
            <Button
                darkTheme={darkTheme}
                text="Apagar"
                className="mt-3"
                variant="danger"
                onClick={handleCancel}
            />
)}
</div>
        </div>
    );
};
CardAvaliation.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

export default CardAvaliation;