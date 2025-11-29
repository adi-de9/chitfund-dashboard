import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import GroupsList from "./pages/groups/GroupsList";
import GroupCreate from "./pages/groups/GroupCreate";
import GroupDetails from "./pages/groups/GroupDetails";
import GroupEdit from "./pages/groups/GroupEdit";
import MemberEdit from "./pages/members/MemberEdit";
import CycleSummary from "./pages/cycles/CycleSummary";
import AuctionInterface from "./pages/auctions/AuctionInterface";
import ContributionsTable from "./pages/contributions/ContributionsTable";
import PenaltiesTable from "./pages/penalties/PenaltiesTable";
import PenaltySettings from "./pages/settings/PenaltySettings";
import LedgerView from "./pages/ledger/LedgerView";
import DocumentUpload from "./pages/documents/DocumentUpload";
import NotificationCenter from "./pages/notifications/NotificationCenter";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "groups",
        element: <GroupsList />,
      },
      {
        path: "groups/create",
        element: <GroupCreate />,
      },
      {
        path: "groups/:id",
        element: <GroupDetails />,
      },
      {
        path: "groups/:id/edit",
        element: <GroupEdit />,
      },
      {
        path: "groups/:groupId/members/:memberId/edit",
        element: <MemberEdit />,
      },
      {
        path: "cycle/:cycleId",
        element: <CycleSummary />,
      },
      {
        path: "cycle/:cycleId/auction",
        element: <AuctionInterface />,
      },
      {
        path: "cycle/:cycleId/contributions",
        element: <ContributionsTable />,
      },
      {
        path: "penalties/:cycleId",
        element: <PenaltiesTable />,
      },
      {
        path: "settings/:groupId",
        element: <PenaltySettings />,
      },
      {
        path: "ledger",
        element: <LedgerView />,
      },
      {
        path: "users/:userId/documents",
        element: <DocumentUpload />,
      },
      {
        path: "notifications",
        element: <NotificationCenter />,
      },
      // Add other routes here
    ],
  },
]);
