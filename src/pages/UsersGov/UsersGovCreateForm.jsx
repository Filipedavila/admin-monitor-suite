import React from 'react';
import { Input, Button, RadioGroup } from 'ama-design-system';
import { useForm } from "react-hook-form";

const UsersGovCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    return (
        <div>
            <h1>Criar Utilizadores Autenticacao.Gov</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Nome"
                    name="username"
                    type="text"
                    {...register("username", { required: true })}
                    error={errors.username ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Número do Cartão de Cidadão"
                    name="citizen_card_number"
                    type="text"
                    {...register("citizen_card_number", { required: true })}
                    error={errors.citizen_card_number ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Utilizadores associados"
                    name="associated_users"
                    type="text"
                    {...register("associated_users", { required: true })}
                    error={errors.associated_users ? "Campo obrigatório" : undefined}
                />

                
                <Button
                    type="submit"
                    text="Criar Utilizador"
                    className="mt-3"
                />
            </form>
        </div>
    );
}
export default UsersGovCreateForm;