import React from 'react';
import { Input, Button, CheckGroup, RadioGroup, Breadcrumb } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';
const DirectoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const breadcrumbs = [
    { children: <Link to="/dashboard/home">Home</Link> },

    {
      title: "Criar Diretórios",
    }
  ];
    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    return (
        <div>
                      <Breadcrumb data={breadcrumbs} />

            <h1>Criar Diretórios</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Nome"
                    name="name"
                    type="text"
                    {...register("name", { required: true })}
                    error={errors.name ? "Campo obrigatório" : undefined}
                />

                <div className="mt-3">
                    <CheckGroup
                        darkTheme="light"
                        data={[
                            {
                                name: 'Mostrar este diretório no observatório',
                            },
                           
                        ]}
                        inline
                        onChange={() => { }}
                        
                    />
                </div>

                <div className='mt-3'>
                    <label>Escolha como formatar o diretório</label>
                    <RadioGroup
                        darkTheme="light"
                        data={[
                            {
                                id: '1',
                                name: 'Intersecção'
                            },
                            {
                                id: '2',
                                name: 'União'
                            },
                        ]}
                        inline
                        onChange={() => { }}
                        value="1"
                    />
                </div>

                <Input
                    label="Selecione as categorias para formar o novo diretório"
                    name="categories"
                    type="text"
                    {...register("categories", { required: true })}
                    error={errors.categories ? "Campo obrigatório" : undefined}
                />

                
                <div className="px-4 d-flex justify-content-end">
                <Button
                    type="submit"
                    text="Criar Diretório"
                    className="mt-3"
                />
                </div>
            </form>
        </div>
    );
}
export default DirectoriesCreateForm;