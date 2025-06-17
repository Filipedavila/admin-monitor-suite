import React from 'react';
import { Input, Button, RadioGroup } from 'ama-design-system';
import { useForm } from "react-hook-form";

const UsersCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    return (
        <div>
            <h1>Criar Utilizadores</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
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
                    showPassTextAria="Mostrar senha"
                    hidePassTextAria="Ocultar senha"
                    {...register("password", { required: true })}
                    error={errors.password ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Confirmar Senha"
                    name="confirmPassword"
                    type="password"
                    showPassTextAria="Mostrar senha"
                    hidePassTextAria="Ocultar senha"
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

                 <div className='mt-3 mb-3'>
                    <RadioGroup
                        darkTheme="light"
                        data={[
                            {
                                id: '1',
                                name: 'Study Monitor'
                            },
                            {
                                id: '2',
                                name: 'MyMonitor'
                            }, {
                                id: '3',
                                name: 'AMS'
                            },
                        ]}
                        inline
                        onChange={() => { }}
                        value="1"
                    />
                </div>
              
                <div className="px-4 d-flex justify-content-end">
                <Button
                    type="submit"
                    text="Criar Utilizador"
                    className="mt-3"
                />
                </div>
            </form>
        </div>
    );
}
export default UsersCreateForm;