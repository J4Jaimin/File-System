import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterUser = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:4000/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Registration successful!");
                navigate("/directory");
            } else {
                alert("Registration failed!");
            }
        } catch (error) {
            console.log(error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form className="bg-white p-8 rounded-lg shadow-md w-96" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

                <label className="block mb-2 font-medium" htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full p-2 border rounded mb-4"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <label className="block mb-2 font-medium" htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-2 border rounded mb-4"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <label className="block mb-2 font-medium" htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full p-2 border rounded mb-6"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default RegisterUser;
