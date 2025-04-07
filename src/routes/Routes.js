/* eslint-disable */
import Login from "../pages/Login/Login"; // Adjusted path
import GlobalDashboard from "../pages/Dashboard/GlobalDashboard"; // Adjusted path
import PrescriptionManage from "../pages/DoctorManagement/Prescription/PrescriptionManage";
import DoctorManage from "../pages/DoctorManagement/Doctor/DoctorManage";
import ListPatient from "../pages/DoctorManagement/Patient/List"

/*========= public routes =============*/

const publicRoutes = [
  //{ path: "/", component: Login }, //login page,
  {path: "/doctors/list", component: DoctorManage}, //doctor list page

  { path: "/prescriptions", component: PrescriptionManage },

  {path: "/patients/list", component: ListPatient},

  {path: "/", component:GlobalDashboard}






];

/*======= protected route start =======*/
const protectedRoutes = [
  /* ======== dashboard start ========== */
  {
    path: "/admin/dashboard",
    component: GlobalDashboard,
  },
];
/*======= protected route end =======*/

export { publicRoutes, protectedRoutes };
