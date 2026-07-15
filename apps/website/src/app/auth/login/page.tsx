"use client";

import { useUser } from "@/context/UserContext";
import { AppDispatch } from "@/store";
import { setUser } from "@/store/userSlice";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUser();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      toast.error("لطفا همه فیلد ها را پر کنید");
    } else {
      setIsLoading(true);
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("نام کاربری یا رمز عبور اشتباه است");
          setIsLoading(false);
        }
        if (response.status === 500) {
          toast.error("خطا در برقراری ارتباط با سرور");
          setIsLoading(false);
        }
      }
      if (response.status === 200) {
        toast.success("وارد شدید. لطفا کمی صبر کنید.");
        const data = await response.json();
        setUser(data.user);
        console.log("user set");
        router.push("/admin");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center login">
      <div className="flex flex-col gap-8">
        <div className="md:w-[600px] h-fit bg-white bg-opacity-45 backdrop-blur-md shadow-md rounded-md p-10 flex flex-col justify-between items-center gap-10">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-sky-600 text-center">
            کلینیک ابراز - ورود
          </h1>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="w-full flex flex-col gap-6">
              <div className="w-full">
                <label>شماره تلفن</label>
                <input
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  type="number"
                  className="w-full bg-white border border-sky-300 py-2 rounded-md shadow-sm px-2 mt-4"
                />
              </div>
              <div className="w-full">
                <label>رمز عبور</label>
                <input
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  type="password"
                  className="w-full bg-white border border-sky-300 py-2 rounded-md shadow-sm px-2 mt-4"
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-44 p-2 rounded-md text-center text-white mt-8
               ${
                 isLoading
                   ? "bg-sky-300 cursor-not-allowed"
                   : "bg-sky-600 cursor-pointer"
               }
              `}
            >
              ورود
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
