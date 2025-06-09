import React from 'react';
import { Input, Button, Breadcrumb } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
const CategoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

        const breadcrumbs = [
    { children: <Link to="/dashboard/home">Home</Link> },

    {
      title: "Criar Categorias",
    }
  ];
    return (
        <div>
                      <Breadcrumb data={breadcrumbs} />

            <h1>Criar Categorias</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Nome da Categoria"
                    name="categoryName"
                    type="text"
                    {...register("categoryName", { required: true })}
                    error={errors.categoryName ? "Campo obrigatório" : undefined}
                />
                 <Input
                    label="Associar Directorios"
                    name="confirmPassword"
                    type="text"
                    {...register("confirmPassword", { required: true })}
                    error={errors.confirmPassword ? "Campo obrigatório" : undefined}
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
                    text="Criar Categoria"
                    className="mt-3"
                />
            </form>
        </div>
    );
}
export default CategoriesCreateForm;