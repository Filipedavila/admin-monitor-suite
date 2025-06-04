import React from 'react';
import { Input, Button } from 'ama-design-system';
import { useForm } from "react-hook-form";

const Users = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    return (
        <div>
            <h1>Criar Utilizadores</h1>
            <form className="w-50" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Nome do Utilizador"
                    name="username"
                    type="text"
                    {...register("username", { required: true })}
                    error={errors.username ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Senha"
                    name="password"
                    type="password"
                    {...register("password", { required: true })}
                    error={errors.password ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Confirmar Senha"
                    name="confirmPassword"
                    type="password"
                    {...register("confirmPassword", { required: true })}
                    error={errors.confirmPassword ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Nomes de Contacto"
                    name="contact_name"
                    type="text"
                    {...register("contact_name", { required: true })}
                    error={errors.contact_name ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Email de Contacto"
                    name="email"
                    type="email"
                    {...register("email", { required: true })}
                    error={errors.email ? "Campo obrigatório" : undefined}
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
export default Users;