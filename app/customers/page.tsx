import { redirect } from "next/navigation";

const CustomersIndexPage = () => {
  redirect("/customers/list");
};

export default CustomersIndexPage;
