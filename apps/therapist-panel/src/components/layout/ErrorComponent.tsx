import Image from "next/image";
import { Button } from "../ui/button";

import error from "../../../public/images/error.png";

const ErrorComponent = ({ refetch }: { refetch: () => void }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <Image src={error} alt="error image" width={200} height={200} />
      <p className="text-center">
        متاسفیم. ظاهرا در دریافت اطلاعات مشکلی پیش اومده.
        <br /> لطفا دوباره امتحان کنین یا اینترنتتون رو بررسی کنین.
      </p>
      <Button onClick={() => refetch()}>تلاش دوباره</Button>
    </div>
  );
};

export default ErrorComponent;
