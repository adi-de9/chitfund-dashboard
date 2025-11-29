# Chit Fund Management System Backend

A robust REST API backend for managing Chit Funds, built with Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Tech Stack
- **Runtime**: [Bun](https://bun.sh) (compatible with Node.js)
- **Framework**: [Express.js](https://expressjs.com)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io)
- **Authentication**: JWT (JSON Web Tokens) with Cookies
- **Validation**: Zod

## 🛠️ Setup & Installation

1.  **Install Dependencies**
    ```bash
    bun install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/chitfund_db?schema=public"
    JWT_ACCESS_SECRET="your_access_secret"
    JWT_REFRESH_SECRET="your_refresh_secret"
    PORT=5000
    ```

3.  **Database Setup**
    ```bash
    bun run prisma:generate
    bun run prisma:migrate
    ```

4.  **Run Server**
    ```bash
    # Development
    bun run dev

    # Production
    bun run start
    ```

## 🔐 Authentication
The API uses **JWT** for authentication.
- **Access Token**: Short-lived (15m), stored in HTTP-only cookie `accessToken`.
- **Refresh Token**: Long-lived (7d), stored in HTTP-only cookie `refreshToken`.
- **Headers**: You can also pass the token in the `Authorization` header: `Bearer <token>`.

## 📚 API Documentation

### 1️⃣ Auth APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public | Body: `{ email, phone, password, name, role }` |
| `POST` | `/api/auth/login` | Login and receive tokens | Public | Body: `{ email, password }` |
| `POST` | `/api/auth/refresh` | Refresh access token | Public | Body: `{ refreshToken }` (or cookie) |
| `POST` | `/api/auth/logout` | Logout (clear cookies) | Public | None |

### 2️⃣ User APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all users | Admin, Staff | None |
| `GET` | `/api/users/:id` | View user profile | Admin, Staff, Member | Param: `id` |
| `POST` | `/api/users` | Create user (Admin adds staff/member) | Admin | Body: `{ email, phone, password, name, role }` |
| `PATCH` | `/api/users/:id` | Update user details | Admin | Param: `id`, Body: Partial user fields |
| `PATCH` | `/api/users/:id/status` | Activate/Deactivate user | Admin | Param: `id`, Body: `{ status: 'active' \| 'inactive' }` |

### 3️⃣ Group APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/groups` | Create a new chit fund group | Admin | Body: `{ group_name, group_code, chit_value, total_members, monthly_contribution, start_date, status }` |
| `GET` | `/api/groups` | List all groups | Admin | None |
| `GET` | `/api/groups/:id` | Group details (members, cycles, auctions) | Admin, Staff, Member | Param: `id` |
| `PATCH` | `/api/groups/:id` | Update group details | Admin | Param: `id`, Body: Partial group fields |
| `PATCH` | `/api/groups/:id/status` | Update group status (active/inactive) | Admin | Param: `id`, Body: `{ status }` |

### 4️⃣ Group Member APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/group-members` | Add a member to a group | Admin | Body: `{ groupId, userId, nomineeName?, nomineePhone? }` |
| `GET` | `/api/group-members/:groupId` | List members of a group | Admin, Staff, Member | Param: `groupId` |
| `PATCH` | `/api/group-members/:id` | Update nominee info | Admin | Param: `id`, Body: Partial member fields |
| `PATCH` | `/api/group-members/:id/won-status` | Update winning status | Admin | Param: `id`, Body: `{ wonStatus: boolean }` |

### 5️⃣ Cycle APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/cycles/create/:groupId` | Create next monthly cycle | Admin | Param: `groupId` |
| `GET` | `/api/cycles/:groupId` | List cycles of a group | Admin, Staff, Member | Param: `groupId` |
| `GET` | `/api/cycles/cycle/:cycleId` | Cycle details (summary) | Admin, Staff, Member | Param: `cycleId` |

### 6️⃣ Contribution APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/contributions/init/:cycleId` | Auto-create pending contributions | Admin | Param: `cycleId` |
| `GET` | `/api/contributions/:cycleId` | List contributions | Admin, Staff, Member | Param: `cycleId` |
| `POST` | `/api/contributions/pay/:contributionId` | Record payment | Admin, Staff | Param: `contributionId`, Body: `{ amount, paymentMode, referenceNo? }` |
| `PATCH` | `/api/contributions/:id/status` | Manual status update | Admin | Param: `id`, Body: `{ status }` |

### 7️⃣ Payment APIs (Sub-payments)
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Add sub-payment | Admin, Staff | Body: `{ contributionId, userId, payerName, amount }` |
| `GET` | `/api/payments/:contributionId` | Get sub-payments | Admin, Staff, Member | Param: `contributionId` |

### 8️⃣ Penalty APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/penalties/apply/:contributionId` | Apply penalty manually | Admin | Param: `contributionId`, Body: `{ amount, reason }` |
| `POST` | `/api/penalties/auto-check/:groupId` | Auto-check overdue | Admin | Param: `groupId` |
| `GET` | `/api/penalties/:cycleId` | List penalties | Admin, Staff, Member | Param: `cycleId` |

### 9️⃣ Admin Settings APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/settings/:groupId` | Get group settings | Admin | Param: `groupId` |
| `PATCH` | `/api/settings/:groupId` | Update settings | Admin | Param: `groupId`, Body: `{ dueDate?, penaltyType?, penaltyValue? }` |

### 🔟 Auction APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auction/run/:cycleId` | Run auction | Admin | Param: `cycleId`, Body: `{ bids: [{ userId, amount }] }` |
| `GET` | `/api/auction/:cycleId` | Get auction result | Admin, Staff, Member | Param: `cycleId` |

### 1️⃣1️⃣ Bid APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bids` | Place bid | Admin, Member | Body: `{ auctionId, userId, bidAmount }` |
| `GET` | `/api/bids/:auctionId` | View bids | Admin, Staff, Member | Param: `auctionId` |

### 1️⃣2️⃣ Ledger APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/ledger/:userId` | User transaction history | Admin, Staff, Member | Param: `userId` |
| `GET` | `/api/ledger/:groupId/:userId` | Group specific history | Admin, Staff, Member | Param: `groupId`, `userId` |
| `POST` | `/api/ledger/add` | Manual ledger entry | Admin | Body: `{ userId, groupId, amount, notes }` |

### 1️⃣3️⃣ Document APIs (KYC)
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | Upload document | Admin, Staff, Member | Body: `{ userId, docType, fileUrl }` |
| `GET` | `/api/documents/:userId` | View documents | Admin, Staff, Member | Param: `userId` |
| `DELETE` | `/api/documents/:id` | Delete document | Admin | Param: `id` |

### 1️⃣4️⃣ Notification APIs
| Method | Endpoint | Description | Access | Request Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/notifications/send` | Send manual notification | Admin | Body: `{ userId, messageType, channel }` |
| `POST` | `/api/notifications/payment-alert/:userId` | Send payment reminder | Admin | Param: `userId` |
| `GET` | `/api/notifications/:userId` | Notification history | Admin, Staff, Member | Param: `userId` |