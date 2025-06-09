import React from 'react';
import { Button } from "ama-design-system";
const InsertCrawling = () => {
    return (
          <div className="p-3 d-flex flex-column justify-content-between p-4">
              <p>2c. Solicitar um crawling ao sítio web</p>
              <p>
                Se pretende que o robô do AdminMonitorSuite produza uma amostra
                automaticamente pressione no botão abaixo. O robô irá gerar uma
                amostra segundo o método H+ Depois basta ir à página "Crawler" e
                importar a amostra de páginas recolhidas pelo robô.
              </p>
              <Button
                type="button"
                text="Gerar Crawler"
                className="mt-3"
                variant="primary"
                onClick={() => console.log("Crawling solicitado")}
              />
            </div>
    );
};

export default InsertCrawling;