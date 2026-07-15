import { useUser } from "@/context/UserContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useLogin(onLogedIn: () => void) {
  const { setUser } = useUser();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.log("fff");
        if (res.status === 401) {
          throw new Error("نام کاربری یا رمز عبور اشتباه است.!");
        }
        const data = await res.json();
        console.log(data);
        throw new Error("خطا در ارسال اطلاعات!");
      }
      const resData = await res.json();
      console.log(resData);
      return resData;
    },
    onError(error) {
      toast.error(error.message);
      console.log(error);
    },
    onSuccess: (result) => {
      setUser(result.user);

      toast.success("با موفقیت وارد شدید. لطفا کمی صبر کنید.");
      onLogedIn();
    },
  });
}

export function useLogout() {
  return useQuery({
    queryKey: ["logout"],
    queryFn: async () => {
      const res = await fetch("/api/auth/logout");
      if (res.status !== 200) {
        toast.error("خطا در فرایند خروج، لطفا دوباره تلاش کنید.");
      }
      return res.json();
    },
    enabled: false,
  });
}

export function useGetToken() {
  return useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const res = await fetch("/api/auth/token");
      if (res.status !== 200) {
        toast.error("خطا در دریافت اطلاعات.");
      }
      return res.json();
    },
    enabled: false,
  });
}
