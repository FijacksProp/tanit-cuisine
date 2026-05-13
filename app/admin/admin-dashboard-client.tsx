"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Inbox,
  LayoutDashboard,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Users,
  Utensils,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatNaira } from "@/lib/format"

type AdminSummary = {
  counts: {
    orders: number
    pendingOrders: number
    contactMessages: number
    newContactMessages: number
    wishlistItems: number
    products: number
    customers: number
    reviews: number
    visibleReviews: number
    users: number
  }
  revenue: number
  topProducts: Array<{
    name: string
    slug: string
    external_id: string
    orderCount: number
  }>
  recentOrders: AdminOrder[]
}

type AdminOrder = {
  id: number
  orderNumber: string
  userEmail: string | null
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  delivery: string
  payment: string
  status: string
  subtotal: number
  deliveryFee: number
  serviceFee: number
  total: number
  items: Array<{ productName: string; quantity: number; lineTotal: number }>
  created_at: string
}

type AdminContact = {
  id: number
  name: string
  email: string
  topic: string
  message: string
  status: string
  created_at: string
}

type AdminProduct = {
  id: number
  externalId: string
  slug: string
  name: string
  category: string
  price: number
  rating: string | number
  reviewCount: number
  featured: boolean
  bestseller: boolean
  isNew: boolean
  isAvailable: boolean
}

type AdminReview = {
  id: number
  productName: string
  productSlug: string
  userEmail: string | null
  author: string
  rating: number
  title: string
  comment: string
  verified: boolean
  isVisible: boolean
  created_at: string
}

type AdminWishlistItem = {
  id: number
  product: {
    id: string
    name: string
    price: number
    category: string
  }
  userEmail: string | null
  sessionKey: string
  created_at: string
}

type AdminCustomer = {
  id: number
  full_name: string
  email: string
  phone: string
  orderCount: number
  created_at: string
}

type AdminUser = {
  id: number
  email: string
  fullName: string
  phone: string
  is_active: boolean
  isEmailVerified: boolean
  isStaff: boolean
  isSuperuser: boolean
  date_joined: string
}

const orderStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
const contactStatuses = ["new", "in_progress", "resolved"]

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function StatusBadge({ value }: { value: string }) {
  const variant =
    value === "cancelled"
      ? "destructive"
      : value === "delivered" || value === "resolved"
        ? "default"
        : value === "new" || value === "pending"
          ? "secondary"
          : "outline"
  return <Badge variant={variant}>{humanize(value)}</Badge>
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  )
}

export function AdminDashboardClient() {
  const { user, accessToken, loading } = useAuth()
  const [summary, setSummary] = React.useState<AdminSummary | null>(null)
  const [orders, setOrders] = React.useState<AdminOrder[]>([])
  const [contacts, setContacts] = React.useState<AdminContact[]>([])
  const [products, setProducts] = React.useState<AdminProduct[]>([])
  const [reviews, setReviews] = React.useState<AdminReview[]>([])
  const [wishlist, setWishlist] = React.useState<AdminWishlistItem[]>([])
  const [customers, setCustomers] = React.useState<AdminCustomer[]>([])
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [query, setQuery] = React.useState("")
  const [busy, setBusy] = React.useState(true)
  const [actionKey, setActionKey] = React.useState<string | null>(null)

  const fetchDashboard = React.useCallback(async () => {
    if (!accessToken || !user?.isStaff) return

    setBusy(true)
    try {
      const requests = [
        apiRequest<AdminSummary>("/admin/summary/", { token: accessToken }),
        apiRequest<AdminOrder[]>("/admin/orders/", { token: accessToken }),
        apiRequest<AdminContact[]>("/admin/contact/", { token: accessToken }),
        apiRequest<AdminProduct[]>("/admin/products/", { token: accessToken }),
        apiRequest<AdminReview[]>("/admin/reviews/", { token: accessToken }),
        apiRequest<AdminWishlistItem[]>("/admin/wishlist/", { token: accessToken }),
        apiRequest<AdminCustomer[]>("/admin/customers/", { token: accessToken }),
      ] as const

      const [summaryData, orderData, contactData, productData, reviewData, wishlistData, customerData] =
        await Promise.all(requests)

      setSummary(summaryData)
      setOrders(orderData)
      setContacts(contactData)
      setProducts(productData)
      setReviews(reviewData)
      setWishlist(wishlistData)
      setCustomers(customerData)

      if (user.isSuperuser) {
        setUsers(await apiRequest<AdminUser[]>("/admin/users/", { token: accessToken }))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load admin dashboard")
    } finally {
      setBusy(false)
    }
  }, [accessToken, user])

  React.useEffect(() => {
    if (!loading) void fetchDashboard()
  }, [fetchDashboard, loading])

  const filteredOrders = React.useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return orders
    return orders.filter((order) =>
      [order.orderNumber, order.fullName, order.email, order.phone, order.status].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )
  }, [orders, query])

  const filteredContacts = React.useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return contacts
    return contacts.filter((message) =>
      [message.name, message.email, message.topic, message.message, message.status].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )
  }, [contacts, query])

  const filteredProducts = React.useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return products
    return products.filter((product) =>
      [product.name, product.slug, product.externalId, product.category].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )
  }, [products, query])

  const filteredReviews = React.useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return reviews
    return reviews.filter((review) =>
      [review.productName, review.author, review.title, review.comment].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )
  }, [reviews, query])

  const patchOrderStatus = async (order: AdminOrder, status: string) => {
    if (!accessToken) return
    setActionKey(`order-${order.id}`)
    try {
      const updated = await apiRequest<AdminOrder>(`/admin/orders/${order.id}/`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ status }),
      })
      setOrders((current) => current.map((item) => (item.id === order.id ? updated : item)))
      toast.success("Order updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order")
    } finally {
      setActionKey(null)
    }
  }

  const patchContactStatus = async (message: AdminContact, status: string) => {
    if (!accessToken) return
    setActionKey(`contact-${message.id}`)
    try {
      const updated = await apiRequest<AdminContact>(`/admin/contact/${message.id}/`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ status }),
      })
      setContacts((current) => current.map((item) => (item.id === message.id ? updated : item)))
      toast.success("Message updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update message")
    } finally {
      setActionKey(null)
    }
  }

  const toggleProduct = async (product: AdminProduct) => {
    if (!accessToken) return
    setActionKey(`product-${product.id}`)
    try {
      const updated = await apiRequest<AdminProduct>(`/admin/products/${product.id}/`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      })
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)))
      toast.success("Product updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update product")
    } finally {
      setActionKey(null)
    }
  }

  const toggleReview = async (review: AdminReview) => {
    if (!accessToken) return
    setActionKey(`review-${review.id}`)
    try {
      const updated = await apiRequest<AdminReview>(`/admin/reviews/${review.id}/`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ isVisible: !review.isVisible }),
      })
      setReviews((current) => current.map((item) => (item.id === review.id ? updated : item)))
      toast.success("Review updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update review")
    } finally {
      setActionKey(null)
    }
  }

  const toggleStaff = async (adminUser: AdminUser) => {
    if (!accessToken || !user?.isSuperuser || adminUser.isSuperuser) return
    setActionKey(`user-${adminUser.id}`)
    try {
      const updated = await apiRequest<AdminUser>(`/admin/users/${adminUser.id}/`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ isStaff: !adminUser.isStaff }),
      })
      setUsers((current) => current.map((item) => (item.id === adminUser.id ? updated : item)))
      toast.success("User access updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user")
    } finally {
      setActionKey(null)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-muted-foreground">Loading dashboard...</div>
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
        <Shield className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-serif text-3xl">Staff sign in required</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/signin">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (!user.isStaff) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
        <Shield className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-serif text-3xl">Dashboard access is restricted</h1>
        <p className="mt-3 text-muted-foreground">Your account is not marked as staff.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <LayoutDashboard className="size-4" />
            Tanit Operations
          </div>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">Admin Dashboard</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={user.isSuperuser ? "default" : "secondary"}>
              {user.isSuperuser ? "Superuser" : "Staff"}
            </Badge>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dashboard"
              className="pl-9 sm:w-72"
            />
          </div>
          <Button variant="outline" onClick={fetchDashboard} disabled={busy}>
            <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Metric icon={ShoppingBag} label="Orders" value={summary?.counts.orders ?? 0} detail={`${summary?.counts.pendingOrders ?? 0} pending`} />
        <Metric icon={Inbox} label="Messages" value={summary?.counts.contactMessages ?? 0} detail={`${summary?.counts.newContactMessages ?? 0} new`} />
        <Metric icon={Utensils} label="Products" value={summary?.counts.products ?? 0} detail={`${summary?.counts.reviews ?? 0} reviews`} />
        <Metric icon={Users} label="Customers" value={summary?.counts.customers ?? 0} detail={formatNaira(summary?.revenue ?? 0)} />
      </section>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto rounded-md bg-secondary/70 p-1">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="products">Menu</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          {user.isSuperuser && <TabsTrigger value="users">Users</TabsTrigger>}
        </TabsList>

        <TabsContent value="orders" className="mt-5">
          <AdminTable title="Orders" icon={ShoppingBag}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <EmptyRow colSpan={6} label={busy ? "Loading orders..." : "No orders found"} />
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">{humanize(order.delivery)} | {humanize(order.payment)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.fullName}</div>
                        <div className="text-xs text-muted-foreground">{order.phone}</div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ")}
                      </TableCell>
                      <TableCell>{formatNaira(order.total)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          disabled={actionKey === `order-${order.id}`}
                          onValueChange={(value) => patchOrderStatus(order, value)}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {humanize(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTable>
        </TabsContent>

        <TabsContent value="messages" className="mt-5">
          <AdminTable title="Contact Messages" icon={Inbox}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <EmptyRow colSpan={5} label={busy ? "Loading messages..." : "No messages found"} />
                ) : (
                  filteredContacts.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div className="font-medium">{message.name}</div>
                        <div className="text-xs text-muted-foreground">{message.email}</div>
                      </TableCell>
                      <TableCell>{humanize(message.topic)}</TableCell>
                      <TableCell className="max-w-md whitespace-normal text-muted-foreground">{message.message}</TableCell>
                      <TableCell>
                        <Select
                          value={message.status}
                          disabled={actionKey === `contact-${message.id}`}
                          onValueChange={(value) => patchContactStatus(message, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contactStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {humanize(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(message.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTable>
        </TabsContent>

        <TabsContent value="products" className="mt-5">
          <AdminTable title="Menu Control" icon={Utensils}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <EmptyRow colSpan={6} label={busy ? "Loading menu..." : "No products found"} />
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.externalId} | {product.slug}</div>
                      </TableCell>
                      <TableCell>{humanize(product.category)}</TableCell>
                      <TableCell>{formatNaira(product.price)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-primary text-primary" />
                          {Number(product.rating).toFixed(1)} ({product.reviewCount})
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.featured && <Badge variant="secondary">Featured</Badge>}
                          {product.bestseller && <Badge variant="secondary">Bestseller</Badge>}
                          {product.isNew && <Badge variant="outline">New</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={product.isAvailable ? "outline" : "secondary"}
                          size="sm"
                          disabled={actionKey === `product-${product.id}`}
                          onClick={() => toggleProduct(product)}
                        >
                          {product.isAvailable ? <CheckCircle2 className="size-4" /> : <EyeOff className="size-4" />}
                          {product.isAvailable ? "Available" : "Hidden"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTable>
        </TabsContent>

        <TabsContent value="reviews" className="mt-5">
          <AdminTable title="Reviews" icon={Star}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Review</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Visibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <EmptyRow colSpan={6} label={busy ? "Loading reviews..." : "No reviews found"} />
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="max-w-md whitespace-normal">
                        <div className="font-medium">{review.title}</div>
                        <div className="text-xs text-muted-foreground">{review.author}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                      </TableCell>
                      <TableCell>{review.productName}</TableCell>
                      <TableCell>{review.rating}/5</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={review.verified ? "default" : "outline"}>
                            {review.verified ? "Verified" : "Unverified"}
                          </Badge>
                          <Badge variant={review.isVisible ? "secondary" : "destructive"}>
                            {review.isVisible ? "Visible" : "Hidden"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(review.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionKey === `review-${review.id}`}
                          onClick={() => toggleReview(review)}
                        >
                          {review.isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          {review.isVisible ? "Hide" : "Show"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTable>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-5">
          <AdminTable title="Wishlist" icon={Star}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlist.length === 0 ? (
                  <EmptyRow colSpan={4} label={busy ? "Loading wishlist..." : "No wishlist items found"} />
                ) : (
                  wishlist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-xs text-muted-foreground">{humanize(item.product.category)}</div>
                      </TableCell>
                      <TableCell>{item.userEmail ?? `Guest ${item.sessionKey.slice(0, 8)}`}</TableCell>
                      <TableCell>{formatNaira(item.product.price)}</TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTable>
        </TabsContent>

        <TabsContent value="customers" className="mt-5">
          <AdminTable title="Customers" icon={Users}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <EmptyRow colSpan={5} label={busy ? "Loading customers..." : "No customers found"} />
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.full_name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>{formatDate(customer.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTable>
        </TabsContent>

        {user.isSuperuser && (
          <TabsContent value="users" className="mt-5">
            <AdminTable title="User Access" icon={Shield}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <EmptyRow colSpan={5} label={busy ? "Loading users..." : "No users found"} />
                  ) : (
                    users.map((adminUser) => (
                      <TableRow key={adminUser.id}>
                        <TableCell>
                          <div className="font-medium">{adminUser.fullName || adminUser.email}</div>
                          <div className="text-xs text-muted-foreground">{adminUser.email}</div>
                        </TableCell>
                        <TableCell>{adminUser.phone || "Not set"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant={adminUser.is_active ? "secondary" : "destructive"}>
                              {adminUser.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {adminUser.isSuperuser && <Badge>Superuser</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(adminUser.date_joined)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={adminUser.isStaff ? "outline" : "secondary"}
                            disabled={adminUser.isSuperuser || actionKey === `user-${adminUser.id}`}
                            onClick={() => toggleStaff(adminUser)}
                          >
                            {adminUser.isStaff ? "Remove staff" : "Make staff"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </AdminTable>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType
  label: string
  value: number
  detail: string
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-4 font-serif text-3xl tabular-nums">{value.toLocaleString("en-NG")}</div>
      <div className="mt-1 text-sm text-muted-foreground">{detail}</div>
    </div>
  )
}

function AdminTable({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <Icon className="size-4 text-primary" />
        <h2 className="font-serif text-xl">{title}</h2>
      </div>
      <div className="p-2 md:p-4">{children}</div>
    </section>
  )
}
