import React from 'react';
import { Input, Button, Breadcrumb } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
const EntitiesCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    const breadcrumbs = [
        { children: <Link to="/">Home</Link> },
        {
            title: "Dashboard",
        }
    ];

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>Criar Entidades</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Nome abreviado"
                    name="entityName"
                    type="text"
                    {...register("entityName", { required: true })}
                    error={errors.entityName ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Nome completo"
                    name="fullName"
                    type="text"
                    {...register("fullName", { required: true })}
                    error={errors.fullName ? "Campo obrigatório" : undefined}
                />

                <Input
                    label="Associar Sítios Web"
                    name="websites"
                    type="text"
                    {...register("websites", { required: true })}
                    error={errors.websites ? "Campo obrigatório" : undefined}
                />


                <Button
                    type="submit"
                    text="Criar Entidade"
                    className="mt-3"
                />
            </form>
        </div>
    );
}
export default EntitiesCreateForm;