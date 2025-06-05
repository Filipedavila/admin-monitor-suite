import React from 'react';
import { Input, Button, CheckGroup, RadioGroup } from 'ama-design-system';
import { useForm } from "react-hook-form";

const DirectoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    return (
        <div>
            <h1>Criar Diretórios</h1>
            <form className="w-50" onSubmit={handleSubmit(onSubmit)}>
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
                                id: '1',
                                name: 'Mostrar este diretório no observatório',
                            }
                        ]}
                        inline
                        onChange={() => { }}
                        value="1"
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

                <Button
                    type="submit"
                    text="Criar Diretório"
                    className="mt-3"
                />
            </form>
        </div>
    );
}
export default DirectoriesCreateForm;