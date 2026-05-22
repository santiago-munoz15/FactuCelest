SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Categorias](
	[IdCategoria] [bigint] NOT NULL,
	[NombreCategoria] [varchar](50) NOT NULL,
	[Descripcion] [varchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[IdCategoria] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Clientes]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Clientes](
	[Documento] [bigint] NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Telefono] [bigint] NULL,
	[Correo] [varchar](100) NULL,
	[Direccion] [varchar](150) NULL,
PRIMARY KEY CLUSTERED 
(
	[Documento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Compras]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Compras](
	[IdCompra] [bigint] NOT NULL,
	[NumeroCompra] [int] NOT NULL,
	[Fecha] [datetime] NULL,
	[TaxIdFK] [bigint] NOT NULL,
	[IdUsuarioFK] [bigint] NOT NULL,
	[Subtotal] [decimal](10, 2) NOT NULL,
	[Impuesto] [decimal](10, 2) NOT NULL,
	[Total] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdCompra] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DetalleCompra]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DetalleCompra](
	[IdDetalleCompra] [bigint] NOT NULL,
	[IdCompraFK] [bigint] NOT NULL,
	[IdProductoFK] [bigint] NOT NULL,
	[Cantidad] [int] NOT NULL,
	[PrecioUnitario] [decimal](10, 2) NOT NULL,
	[Subtotal] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdDetalleCompra] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DetalleFactura]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DetalleFactura](
	[IdDetalleFactura] [bigint] NOT NULL,
	[IdFacturaFK] [bigint] NOT NULL,
	[IdProductoFK] [bigint] NOT NULL,
	[Cantidad] [int] NOT NULL,
	[PrecioUnitario] [decimal](10, 2) NOT NULL,
	[Subtotal] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdDetalleFactura] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Facturas]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Facturas](
	[IdFactura] [bigint] IDENTITY(1,1) NOT NULL,
	[IdClienteFK] [bigint] NOT NULL,
	[Fecha] [datetime] NULL,
	[Subtotal] [decimal](10, 2) NOT NULL,
	[Impuesto] [decimal](10, 2) NOT NULL,
	[Total] [decimal](10, 2) NOT NULL,
	[MetodoPago] [varchar](30) NULL,
 CONSTRAINT [PK__Facturas__50E7BAF1EC6DA02C] PRIMARY KEY CLUSTERED 
(
	[IdFactura] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InicioSesion]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InicioSesion](
	[IdUsuario] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Email] [varchar](100) NOT NULL,
	[Password] [varchar](255) NOT NULL,
	[CodigoVerificacion] [varchar](10) NULL,
	[Verificado] [bit] NULL,
	[FechaRegistro] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[IdUsuario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Productos]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Productos](
	[IdProducto] [int] IDENTITY(1,1) NOT NULL,
	[Referencia] [varchar](100) NULL,
	[Descripcion] [varchar](255) NULL,
	[Talla] [varchar](10) NULL,
	[PrecioVenta] [decimal](10, 2) NULL,
	[PrecioCompra] [decimal](10, 2) NULL,
	[IdCategoriaFK] [bigint] NOT NULL,
	[TaxIdFK] [bigint] NULL,
 CONSTRAINT [PK__Producto__0988921074358F7C] PRIMARY KEY CLUSTERED 
(
	[IdProducto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Proveedores]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Proveedores](
	[TaxId] [bigint] NOT NULL,
	[NombreEmpresa] [varchar](100) NOT NULL,
	[NombreContacto] [varchar](100) NULL,
	[Telefono] [bigint] NULL,
	[Correo] [varchar](100) NULL,
	[Direccion] [varchar](150) NULL,
	[CondicionesPago] [varchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[TaxId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Usuarios]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuarios](
	[IdUsuario] [bigint] NOT NULL,
	[PrimerNombre] [varchar](50) NOT NULL,
	[SegundoNombre] [varchar](50) NULL,
	[PrimerApellido] [varchar](50) NOT NULL,
	[SegundoApellido] [varchar](50) NULL,
	[TipoDocumento] [varchar](50) NULL,
	[Documento] [bigint] NOT NULL,
	[Cargo] [varchar](30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdUsuario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (501, N'Ropa interior femenina', N'Conjunto, brasier, panty')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (502, N'Pijamas mujer', N'Pijamas de algodón y seda')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (503, N'Accesorios', N'Pantuflas, antifaces, ligas')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (504, N'Pijamas', N'Pijamas de dama en diferentes materiales y estilos')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (505, N'Ropa Interior', N'Productos íntimos femeninos como brasieres y panties')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (506, N'Conjuntos', N'Conjuntos de ropa interior de dos piezas')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (507, N'Panties', N'Panties de encaje, algodón y control')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (508, N'Brasieres', N'Brasieres de varios estilos: push-up, algodón y deportivos')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (509, N'Lencería', N'Prendas de lencería fina con encaje y satin')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (510, N'Deportivo Dama', N'Ropa interior y pijamas deportivas para dama')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (511, N'Algodón Premium', N'Productos elaborados 100% en algodón de alta calidad')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (512, N'Encaje Fino', N'Prendas elaboradas en encaje delicado y premium')
INSERT [dbo].[Categorias] ([IdCategoria], [NombreCategoria], [Descripcion]) VALUES (513, N'Juvenil', N'Línea juvenil con colores vibrantes y estampados modernos')
GO
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (301, N'Juan', 3105671234, N'juanlopez@gmail.com', N'Cra 45 #32-20 Medellín')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (302, N'María', 3116782345, N'camilatorres@gmail.com', N'Calle 10 #45-12 Envigado')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (303, N'Sara', 3025672345, N'sarares@gmail.com', N'Calle 30 #80-15 Bello')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (12548587, N'sara', 3256885, N'sara@gmail.com', N'calle36')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (15506398, N'Jairo muñoz', 3122369658, N'jairo@gmail.com', N'calle43')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (15696352, N'sergio', 302245215, N'sergio@gmail.com', N'calle36')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (1022458874, N'sebastian', 3025485689, N'sebas@gmail.com', N'calle37')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (1035869986, N'Santiago Muñoz', 3017434473, N'santy8451@hotmail.com', N'calle53')
INSERT [dbo].[Clientes] ([Documento], [Nombre], [Telefono], [Correo], [Direccion]) VALUES (1045421633, N'henry gil agudelo', 31245687, N'henry@gmail.com', N'calle43')
GO
INSERT [dbo].[Compras] ([IdCompra], [NumeroCompra], [Fecha], [TaxIdFK], [IdUsuarioFK], [Subtotal], [Impuesto], [Total]) VALUES (901, 5001, CAST(N'2025-10-11T22:41:54.070' AS DateTime), 401, 3, CAST(180000.00 AS Decimal(10, 2)), CAST(34200.00 AS Decimal(10, 2)), CAST(214200.00 AS Decimal(10, 2)))
INSERT [dbo].[Compras] ([IdCompra], [NumeroCompra], [Fecha], [TaxIdFK], [IdUsuarioFK], [Subtotal], [Impuesto], [Total]) VALUES (902, 5002, CAST(N'2025-10-11T22:41:54.073' AS DateTime), 402, 2, CAST(150000.00 AS Decimal(10, 2)), CAST(28500.00 AS Decimal(10, 2)), CAST(178500.00 AS Decimal(10, 2)))
INSERT [dbo].[Compras] ([IdCompra], [NumeroCompra], [Fecha], [TaxIdFK], [IdUsuarioFK], [Subtotal], [Impuesto], [Total]) VALUES (903, 5003, CAST(N'2025-10-11T22:41:54.073' AS DateTime), 403, 1, CAST(200000.00 AS Decimal(10, 2)), CAST(38000.00 AS Decimal(10, 2)), CAST(238000.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[DetalleCompra] ([IdDetalleCompra], [IdCompraFK], [IdProductoFK], [Cantidad], [PrecioUnitario], [Subtotal]) VALUES (1001, 901, 601, 20, CAST(40000.00 AS Decimal(10, 2)), CAST(800000.00 AS Decimal(10, 2)))
INSERT [dbo].[DetalleCompra] ([IdDetalleCompra], [IdCompraFK], [IdProductoFK], [Cantidad], [PrecioUnitario], [Subtotal]) VALUES (1002, 902, 602, 15, CAST(50000.00 AS Decimal(10, 2)), CAST(750000.00 AS Decimal(10, 2)))
INSERT [dbo].[DetalleCompra] ([IdDetalleCompra], [IdCompraFK], [IdProductoFK], [Cantidad], [PrecioUnitario], [Subtotal]) VALUES (1003, 903, 603, 30, CAST(18000.00 AS Decimal(10, 2)), CAST(540000.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[DetalleFactura] ([IdDetalleFactura], [IdFacturaFK], [IdProductoFK], [Cantidad], [PrecioUnitario], [Subtotal]) VALUES (801, 701, 601, 2, CAST(65000.00 AS Decimal(10, 2)), CAST(130000.00 AS Decimal(10, 2)))
INSERT [dbo].[DetalleFactura] ([IdDetalleFactura], [IdFacturaFK], [IdProductoFK], [Cantidad], [PrecioUnitario], [Subtotal]) VALUES (802, 702, 602, 1, CAST(85000.00 AS Decimal(10, 2)), CAST(85000.00 AS Decimal(10, 2)))
INSERT [dbo].[DetalleFactura] ([IdDetalleFactura], [IdFacturaFK], [IdProductoFK], [Cantidad], [PrecioUnitario], [Subtotal]) VALUES (803, 703, 603, 2, CAST(30000.00 AS Decimal(10, 2)), CAST(60000.00 AS Decimal(10, 2)))
GO
SET IDENTITY_INSERT [dbo].[Facturas] ON 

INSERT [dbo].[Facturas] ([IdFactura], [IdClienteFK], [Fecha], [Subtotal], [Impuesto], [Total], [MetodoPago]) VALUES (701, 301, CAST(N'2025-10-11T22:39:10.443' AS DateTime), CAST(145000.00 AS Decimal(10, 2)), CAST(27550.00 AS Decimal(10, 2)), CAST(172550.00 AS Decimal(10, 2)), N'Efectivo')
INSERT [dbo].[Facturas] ([IdFactura], [IdClienteFK], [Fecha], [Subtotal], [Impuesto], [Total], [MetodoPago]) VALUES (702, 302, CAST(N'2025-10-11T22:39:10.473' AS DateTime), CAST(85000.00 AS Decimal(10, 2)), CAST(16150.00 AS Decimal(10, 2)), CAST(101150.00 AS Decimal(10, 2)), N'Nequi')
INSERT [dbo].[Facturas] ([IdFactura], [IdClienteFK], [Fecha], [Subtotal], [Impuesto], [Total], [MetodoPago]) VALUES (703, 303, CAST(N'2025-10-11T22:39:10.473' AS DateTime), CAST(65000.00 AS Decimal(10, 2)), CAST(12350.00 AS Decimal(10, 2)), CAST(77350.00 AS Decimal(10, 2)), N'Tarjeta')
INSERT [dbo].[Facturas] ([IdFactura], [IdClienteFK], [Fecha], [Subtotal], [Impuesto], [Total], [MetodoPago]) VALUES (704, 1035869986, CAST(N'2025-11-15T21:16:49.327' AS DateTime), CAST(115000.00 AS Decimal(10, 2)), CAST(21850.00 AS Decimal(10, 2)), CAST(136850.00 AS Decimal(10, 2)), N'Efectivo')
INSERT [dbo].[Facturas] ([IdFactura], [IdClienteFK], [Fecha], [Subtotal], [Impuesto], [Total], [MetodoPago]) VALUES (705, 1035869986, CAST(N'2025-11-15T21:50:28.043' AS DateTime), CAST(185000.00 AS Decimal(10, 2)), CAST(35150.00 AS Decimal(10, 2)), CAST(220150.00 AS Decimal(10, 2)), N'Efectivo')
SET IDENTITY_INSERT [dbo].[Facturas] OFF
GO
SET IDENTITY_INSERT [dbo].[InicioSesion] ON 

INSERT [dbo].[InicioSesion] ([IdUsuario], [Nombre], [Email], [Password], [CodigoVerificacion], [Verificado], [FechaRegistro]) VALUES (9, N'Manuela', N'manuela.gomez36@correo.tdea.edu.co', N'12345', N'279300', 0, CAST(N'2025-11-04T20:26:54.057' AS DateTime))
INSERT [dbo].[InicioSesion] ([IdUsuario], [Nombre], [Email], [Password], [CodigoVerificacion], [Verificado], [FechaRegistro]) VALUES (10, N'santiago', N'santiago.munoz15@correo.tdea.edu.co', N'12345', N'670243', 0, CAST(N'2025-11-04T20:59:10.127' AS DateTime))
INSERT [dbo].[InicioSesion] ([IdUsuario], [Nombre], [Email], [Password], [CodigoVerificacion], [Verificado], [FechaRegistro]) VALUES (11, N'brahian', N'brahiandres@hotmail.com', N'123654789', N'467266', 0, CAST(N'2025-11-06T20:30:23.790' AS DateTime))
SET IDENTITY_INSERT [dbo].[InicioSesion] OFF
GO
SET IDENTITY_INSERT [dbo].[Productos] ON 

INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (4, N'PJ', N'Pijama satín rosa', N'L', CAST(85000.00 AS Decimal(10, 2)), CAST(50000.00 AS Decimal(10, 2)), 502, 402)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (5, N'PT', N'Pantuflas suaves', N'35', CAST(30000.00 AS Decimal(10, 2)), CAST(18000.00 AS Decimal(10, 2)), 503, 403)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1009, N'PJ001', N'Pijama algodón estampada', N'S', CAST(52000.00 AS Decimal(10, 2)), CAST(35000.00 AS Decimal(10, 2)), 504, 404)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1010, N'PJ002', N'Pijama algodón estampada', N'M', CAST(52000.00 AS Decimal(10, 2)), CAST(35000.00 AS Decimal(10, 2)), 504, 404)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1011, N'PJ003', N'Pijama algodón estampada', N'L', CAST(52000.00 AS Decimal(10, 2)), CAST(35000.00 AS Decimal(10, 2)), 504, 404)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1012, N'PJ004', N'Pijama satin elegancia', N'S', CAST(65000.00 AS Decimal(10, 2)), CAST(42000.00 AS Decimal(10, 2)), 504, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1013, N'PJ005', N'Pijama satin elegancia', N'M', CAST(65000.00 AS Decimal(10, 2)), CAST(42000.00 AS Decimal(10, 2)), 504, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1014, N'PJ006', N'Pijama satin elegancia', N'L', CAST(65000.00 AS Decimal(10, 2)), CAST(42000.00 AS Decimal(10, 2)), 504, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1015, N'PJ007', N'Pijama corta juvenil', N'S', CAST(48000.00 AS Decimal(10, 2)), CAST(30000.00 AS Decimal(10, 2)), 504, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1016, N'PJ008', N'Pijama corta juvenil', N'M', CAST(48000.00 AS Decimal(10, 2)), CAST(30000.00 AS Decimal(10, 2)), 504, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1017, N'PJ009', N'Pijama corta juvenil', N'L', CAST(48000.00 AS Decimal(10, 2)), CAST(30000.00 AS Decimal(10, 2)), 504, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1018, N'PJ010', N'Pijama térmica polar', N'S', CAST(78000.00 AS Decimal(10, 2)), CAST(52000.00 AS Decimal(10, 2)), 504, 411)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1019, N'PJ011', N'Pijama térmica polar', N'M', CAST(78000.00 AS Decimal(10, 2)), CAST(52000.00 AS Decimal(10, 2)), 504, 411)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1020, N'PJ012', N'Pijama térmica polar', N'L', CAST(78000.00 AS Decimal(10, 2)), CAST(52000.00 AS Decimal(10, 2)), 504, 411)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1021, N'PJ013', N'Pijama encaje delicado', N'S', CAST(60000.00 AS Decimal(10, 2)), CAST(40000.00 AS Decimal(10, 2)), 504, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1022, N'PJ014', N'Pijama encaje delicado', N'M', CAST(60000.00 AS Decimal(10, 2)), CAST(40000.00 AS Decimal(10, 2)), 504, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1023, N'PJ015', N'Pijama encaje delicado', N'L', CAST(60000.00 AS Decimal(10, 2)), CAST(40000.00 AS Decimal(10, 2)), 504, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1024, N'PJ016', N'Pijama deportiva dama', N'S', CAST(55000.00 AS Decimal(10, 2)), CAST(36000.00 AS Decimal(10, 2)), 504, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1025, N'PJ017', N'Pijama deportiva dama', N'M', CAST(55000.00 AS Decimal(10, 2)), CAST(36000.00 AS Decimal(10, 2)), 504, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1026, N'PJ018', N'Pijama deportiva dama', N'L', CAST(55000.00 AS Decimal(10, 2)), CAST(36000.00 AS Decimal(10, 2)), 504, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1027, N'PJ019', N'Pijama kimono floral', N'S', CAST(72000.00 AS Decimal(10, 2)), CAST(48000.00 AS Decimal(10, 2)), 504, 412)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1028, N'PJ020', N'Pijama kimono floral', N'M', CAST(72000.00 AS Decimal(10, 2)), CAST(48000.00 AS Decimal(10, 2)), 504, 412)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1029, N'RI001', N'Brasier encaje push-up', N'32', CAST(38000.00 AS Decimal(10, 2)), CAST(24000.00 AS Decimal(10, 2)), 505, 405)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1030, N'RI002', N'Brasier encaje push-up', N'34', CAST(38000.00 AS Decimal(10, 2)), CAST(24000.00 AS Decimal(10, 2)), 505, 405)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1031, N'RI003', N'Brasier encaje push-up', N'36', CAST(38000.00 AS Decimal(10, 2)), CAST(24000.00 AS Decimal(10, 2)), 505, 405)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1032, N'RI004', N'Panty encaje brasilera', N'S', CAST(15000.00 AS Decimal(10, 2)), CAST(9000.00 AS Decimal(10, 2)), 505, 406)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1033, N'RI005', N'Panty encaje brasilera', N'M', CAST(15000.00 AS Decimal(10, 2)), CAST(9000.00 AS Decimal(10, 2)), 505, 406)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1034, N'RI006', N'Panty encaje brasilera', N'L', CAST(15000.00 AS Decimal(10, 2)), CAST(9000.00 AS Decimal(10, 2)), 505, 406)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1035, N'RI007', N'Panty algodón clásico', N'S', CAST(12000.00 AS Decimal(10, 2)), CAST(7000.00 AS Decimal(10, 2)), 505, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1036, N'RI008', N'Panty algodón clásico', N'M', CAST(12000.00 AS Decimal(10, 2)), CAST(7000.00 AS Decimal(10, 2)), 505, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1037, N'RI009', N'Panty algodón clásico', N'L', CAST(12000.00 AS Decimal(10, 2)), CAST(7000.00 AS Decimal(10, 2)), 505, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1038, N'RI010', N'Panty control tiro alto', N'S', CAST(20000.00 AS Decimal(10, 2)), CAST(13000.00 AS Decimal(10, 2)), 505, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1039, N'RI011', N'Panty control tiro alto', N'M', CAST(20000.00 AS Decimal(10, 2)), CAST(13000.00 AS Decimal(10, 2)), 505, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1040, N'RI012', N'Panty control tiro alto', N'L', CAST(20000.00 AS Decimal(10, 2)), CAST(13000.00 AS Decimal(10, 2)), 505, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1041, N'RI013', N'Conjunto encaje 2 piezas', N'S', CAST(52000.00 AS Decimal(10, 2)), CAST(34000.00 AS Decimal(10, 2)), 505, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1042, N'RI014', N'Conjunto encaje 2 piezas', N'M', CAST(52000.00 AS Decimal(10, 2)), CAST(34000.00 AS Decimal(10, 2)), 505, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1043, N'RI015', N'Conjunto encaje 2 piezas', N'L', CAST(52000.00 AS Decimal(10, 2)), CAST(34000.00 AS Decimal(10, 2)), 505, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1044, N'RI016', N'Top deportivo dama', N'S', CAST(30000.00 AS Decimal(10, 2)), CAST(18000.00 AS Decimal(10, 2)), 505, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1045, N'RI017', N'Top deportivo dama', N'M', CAST(30000.00 AS Decimal(10, 2)), CAST(18000.00 AS Decimal(10, 2)), 505, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1046, N'RI018', N'Top deportivo dama', N'L', CAST(30000.00 AS Decimal(10, 2)), CAST(18000.00 AS Decimal(10, 2)), 505, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1047, N'RI019', N'Brasier básico algodón', N'32', CAST(25000.00 AS Decimal(10, 2)), CAST(16000.00 AS Decimal(10, 2)), 505, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1048, N'RI020', N'Brasier básico algodón', N'34', CAST(25000.00 AS Decimal(10, 2)), CAST(16000.00 AS Decimal(10, 2)), 505, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1049, N'CJ001', N'Conjunto lencería encaje', N'S', CAST(65000.00 AS Decimal(10, 2)), CAST(43000.00 AS Decimal(10, 2)), 506, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1050, N'CJ002', N'Conjunto lencería encaje', N'M', CAST(65000.00 AS Decimal(10, 2)), CAST(43000.00 AS Decimal(10, 2)), 506, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1051, N'CJ003', N'Conjunto lencería encaje', N'L', CAST(65000.00 AS Decimal(10, 2)), CAST(43000.00 AS Decimal(10, 2)), 506, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1052, N'CJ004', N'Conjunto juvenil estampado', N'S', CAST(40000.00 AS Decimal(10, 2)), CAST(25000.00 AS Decimal(10, 2)), 506, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1053, N'CJ005', N'Conjunto juvenil estampado', N'M', CAST(40000.00 AS Decimal(10, 2)), CAST(25000.00 AS Decimal(10, 2)), 506, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1054, N'CJ006', N'Conjunto juvenil estampado', N'L', CAST(40000.00 AS Decimal(10, 2)), CAST(25000.00 AS Decimal(10, 2)), 506, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1055, N'CJ007', N'Conjunto algodón suave', N'S', CAST(35000.00 AS Decimal(10, 2)), CAST(21000.00 AS Decimal(10, 2)), 506, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1056, N'CJ008', N'Conjunto algodón suave', N'M', CAST(35000.00 AS Decimal(10, 2)), CAST(21000.00 AS Decimal(10, 2)), 506, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1057, N'CJ009', N'Conjunto algodón suave', N'L', CAST(35000.00 AS Decimal(10, 2)), CAST(21000.00 AS Decimal(10, 2)), 506, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1058, N'CJ010', N'Conjunto deportivo dama', N'S', CAST(45000.00 AS Decimal(10, 2)), CAST(28000.00 AS Decimal(10, 2)), 506, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1059, N'CJ011', N'Conjunto deportivo dama', N'M', CAST(45000.00 AS Decimal(10, 2)), CAST(28000.00 AS Decimal(10, 2)), 506, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1060, N'CJ012', N'Conjunto deportivo dama', N'L', CAST(45000.00 AS Decimal(10, 2)), CAST(28000.00 AS Decimal(10, 2)), 506, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1061, N'PT001', N'Panty algodón premium', N'S', CAST(14000.00 AS Decimal(10, 2)), CAST(9000.00 AS Decimal(10, 2)), 507, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1062, N'PT002', N'Panty algodón premium', N'M', CAST(14000.00 AS Decimal(10, 2)), CAST(9000.00 AS Decimal(10, 2)), 507, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1063, N'PT003', N'Panty algodón premium', N'L', CAST(14000.00 AS Decimal(10, 2)), CAST(9000.00 AS Decimal(10, 2)), 507, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1064, N'PT004', N'Panty encaje floral', N'S', CAST(16000.00 AS Decimal(10, 2)), CAST(10000.00 AS Decimal(10, 2)), 507, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1065, N'PT005', N'Panty encaje floral', N'M', CAST(16000.00 AS Decimal(10, 2)), CAST(10000.00 AS Decimal(10, 2)), 507, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1066, N'PT006', N'Panty encaje floral', N'L', CAST(16000.00 AS Decimal(10, 2)), CAST(10000.00 AS Decimal(10, 2)), 507, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1067, N'PT007', N'Panty juvenil estampado', N'S', CAST(12000.00 AS Decimal(10, 2)), CAST(7000.00 AS Decimal(10, 2)), 507, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1068, N'PT008', N'Panty juvenil estampado', N'M', CAST(12000.00 AS Decimal(10, 2)), CAST(7000.00 AS Decimal(10, 2)), 507, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1069, N'PT009', N'Panty juvenil estampado', N'L', CAST(12000.00 AS Decimal(10, 2)), CAST(7000.00 AS Decimal(10, 2)), 507, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1070, N'PT010', N'Panty control abdomen', N'S', CAST(18000.00 AS Decimal(10, 2)), CAST(12000.00 AS Decimal(10, 2)), 507, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1071, N'PT011', N'Panty control abdomen', N'M', CAST(18000.00 AS Decimal(10, 2)), CAST(12000.00 AS Decimal(10, 2)), 507, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1072, N'PT012', N'Panty control abdomen', N'L', CAST(18000.00 AS Decimal(10, 2)), CAST(12000.00 AS Decimal(10, 2)), 507, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1073, N'BR001', N'Brasier clásico algodón', N'32', CAST(26000.00 AS Decimal(10, 2)), CAST(16000.00 AS Decimal(10, 2)), 508, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1074, N'BR002', N'Brasier clásico algodón', N'34', CAST(26000.00 AS Decimal(10, 2)), CAST(16000.00 AS Decimal(10, 2)), 508, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1075, N'BR003', N'Brasier clásico algodón', N'36', CAST(26000.00 AS Decimal(10, 2)), CAST(16000.00 AS Decimal(10, 2)), 508, 407)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1076, N'BR004', N'Brasier encaje luxury', N'32', CAST(42000.00 AS Decimal(10, 2)), CAST(28000.00 AS Decimal(10, 2)), 508, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1077, N'BR005', N'Brasier encaje luxury', N'34', CAST(42000.00 AS Decimal(10, 2)), CAST(28000.00 AS Decimal(10, 2)), 508, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1078, N'BR006', N'Brasier encaje luxury', N'36', CAST(42000.00 AS Decimal(10, 2)), CAST(28000.00 AS Decimal(10, 2)), 508, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1079, N'BR007', N'Brasier deportivo', N'S', CAST(30000.00 AS Decimal(10, 2)), CAST(20000.00 AS Decimal(10, 2)), 508, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1080, N'BR008', N'Brasier deportivo', N'M', CAST(30000.00 AS Decimal(10, 2)), CAST(20000.00 AS Decimal(10, 2)), 508, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1081, N'BR009', N'Brasier deportivo', N'L', CAST(30000.00 AS Decimal(10, 2)), CAST(20000.00 AS Decimal(10, 2)), 508, 409)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1082, N'BR010', N'Brasier juvenil estampado', N'S', CAST(25000.00 AS Decimal(10, 2)), CAST(15000.00 AS Decimal(10, 2)), 508, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1083, N'BR011', N'Brasier juvenil estampado', N'M', CAST(25000.00 AS Decimal(10, 2)), CAST(15000.00 AS Decimal(10, 2)), 508, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1084, N'BR012', N'Brasier juvenil estampado', N'L', CAST(25000.00 AS Decimal(10, 2)), CAST(15000.00 AS Decimal(10, 2)), 508, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1085, N'LC001', N'Body encaje premium', N'S', CAST(78000.00 AS Decimal(10, 2)), CAST(54000.00 AS Decimal(10, 2)), 509, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1086, N'LC002', N'Body encaje premium', N'M', CAST(78000.00 AS Decimal(10, 2)), CAST(54000.00 AS Decimal(10, 2)), 509, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1087, N'LC003', N'Body encaje premium', N'L', CAST(78000.00 AS Decimal(10, 2)), CAST(54000.00 AS Decimal(10, 2)), 509, 408)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1088, N'LC004', N'Baby doll satin', N'S', CAST(68000.00 AS Decimal(10, 2)), CAST(45000.00 AS Decimal(10, 2)), 509, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1089, N'LC005', N'Baby doll satin', N'M', CAST(68000.00 AS Decimal(10, 2)), CAST(45000.00 AS Decimal(10, 2)), 509, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1090, N'LC006', N'Baby doll satin', N'L', CAST(68000.00 AS Decimal(10, 2)), CAST(45000.00 AS Decimal(10, 2)), 509, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1091, N'LC007', N'Camisón transparente', N'S', CAST(72000.00 AS Decimal(10, 2)), CAST(48000.00 AS Decimal(10, 2)), 509, 412)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1092, N'LC008', N'Camisón transparente', N'M', CAST(72000.00 AS Decimal(10, 2)), CAST(48000.00 AS Decimal(10, 2)), 509, 412)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1093, N'LC009', N'Camisón transparente', N'L', CAST(72000.00 AS Decimal(10, 2)), CAST(48000.00 AS Decimal(10, 2)), 509, 412)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1094, N'LC010', N'Body microtul', N'S', CAST(75000.00 AS Decimal(10, 2)), CAST(50000.00 AS Decimal(10, 2)), 509, 410)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1095, N'JV001', N'Top juvenil estampado', N'S', CAST(28000.00 AS Decimal(10, 2)), CAST(18000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1096, N'JV002', N'Top juvenil estampado', N'M', CAST(28000.00 AS Decimal(10, 2)), CAST(18000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1097, N'JV003', N'Top juvenil estampado', N'L', CAST(28000.00 AS Decimal(10, 2)), CAST(18000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1098, N'JV004', N'Short juvenil algodón', N'S', CAST(20000.00 AS Decimal(10, 2)), CAST(12000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1099, N'JV005', N'Short juvenil algodón', N'M', CAST(20000.00 AS Decimal(10, 2)), CAST(12000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1100, N'JV006', N'Short juvenil algodón', N'L', CAST(20000.00 AS Decimal(10, 2)), CAST(12000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1101, N'JV007', N'Crop top juvenil', N'S', CAST(25000.00 AS Decimal(10, 2)), CAST(15000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1102, N'JV008', N'Crop top juvenil', N'M', CAST(25000.00 AS Decimal(10, 2)), CAST(15000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1103, N'JV009', N'Crop top juvenil', N'L', CAST(25000.00 AS Decimal(10, 2)), CAST(15000.00 AS Decimal(10, 2)), 513, 413)
INSERT [dbo].[Productos] ([IdProducto], [Referencia], [Descripcion], [Talla], [PrecioVenta], [PrecioCompra], [IdCategoriaFK], [TaxIdFK]) VALUES (1104, N'JV010', N'Conjunto juvenil 2 piezas', N'S', CAST(38000.00 AS Decimal(10, 2)), CAST(25000.00 AS Decimal(10, 2)), 513, 413)
SET IDENTITY_INSERT [dbo].[Productos] OFF
GO
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (401, N'Moda Íntima Colombia', N'Sandra Vélez', 6045556789, N'info@modaintima.com', N'Cra 50 #40-11 Itagüí', N'Pago inmediato')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (402, N'Textiles Medellín', N'Andrés Zapata', 6044441122, N'ventas@textilesmedellin.com', N'Calle 10 #25-50 Medellín', N'Crédito 15 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (403, N'Fábrica de Pijamas SA', N'Marcos Giraldo', 6046677788, N'contacto@pijamasa.com', N'Cra 23 #44-22 Medellín', N'Crédito 20 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (404, N'DreamWear', N'Laura Gómez', 3004567890, N'contacto@dreamwear.com', N'Cra 45 # 32-21 Medellín', N'Pago a 30 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (405, N'IntimaCol', N'Sofía Restrepo', 3012345678, N'ventas@intimacol.com', N'Calle 10 # 22-15 Bogotá', N'Pago inmediato')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (406, N'DulceIntimo', N'María Cárdenas', 3209876543, N'info@dulceintimo.com', N'Av. Oriental # 54-90 Medellín', N'Pago a 15 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (407, N'CottonSoft', N'Ana Torres', 3112233445, N'contacto@cottonsoft.com', N'Cra 80 # 10-33 Cali', N'Pago a 30 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (408, N'LuxuryIntimates', N'Valentina Pérez', 3129988776, N'ventas@luxuryintimates.com', N'Calle 50 # 45-12 Medellín', N'Pago anticipado 50%')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (409, N'SportLine', N'Carolina Silva', 3001122334, N'soporte@sportline.com', N'Cra 30 # 18-09 Bogotá', N'Pago a 20 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (410, N'SoftLace', N'Daniela Mejía', 3223344556, N'ventas@softlace.com', N'Calle 9 # 40-15 Bucaramanga', N'Pago a 30 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (411, N'WarmNight', N'Tatiana López', 3155566778, N'contacto@warmnight.com', N'Cra 25 # 14-62 Medellín', N'Pago contra entrega')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (412, N'ZenWear', N'Jimena Arango', 3007788991, N'info@zenwear.com', N'Calle 72 # 11-08 Bogotá', N'Pago a 45 días')
INSERT [dbo].[Proveedores] ([TaxId], [NombreEmpresa], [NombreContacto], [Telefono], [Correo], [Direccion], [CondicionesPago]) VALUES (413, N'JuventudX', N'Camila Rojas', 3174455667, N'contacto@juventudx.com', N'Calle 33 # 20-55 Cali', N'Pago inmediato')
GO
INSERT [dbo].[Usuarios] ([IdUsuario], [PrimerNombre], [SegundoNombre], [PrimerApellido], [SegundoApellido], [TipoDocumento], [Documento], [Cargo]) VALUES (1, N'Mateo', N'', N'González', N'Rodríguez', N'CC', 1001000010, N'Administrador')
INSERT [dbo].[Usuarios] ([IdUsuario], [PrimerNombre], [SegundoNombre], [PrimerApellido], [SegundoApellido], [TipoDocumento], [Documento], [Cargo]) VALUES (2, N'Santiago', N'', N'Muñoz', N'Zapata', N'CC', 1001000011, N'Vendedor')
INSERT [dbo].[Usuarios] ([IdUsuario], [PrimerNombre], [SegundoNombre], [PrimerApellido], [SegundoApellido], [TipoDocumento], [Documento], [Cargo]) VALUES (3, N'Manuela', N'', N'Gomez', N'Patiño', N'CC', 1001000012, N'Vendedor')
GO
/****** Object:  Index [UQ__Compras__5F9B8DEC46448B77]    Script Date: 11/15/2025 10:10:58 PM ******/
ALTER TABLE [dbo].[Compras] ADD UNIQUE NONCLUSTERED 
(
	[NumeroCompra] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__InicioSe__A9D105344585B9AB]    Script Date: 11/15/2025 10:10:58 PM ******/
ALTER TABLE [dbo].[InicioSesion] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__Usuarios__AF73706DAB18CE86]    Script Date: 11/15/2025 10:10:58 PM ******/
ALTER TABLE [dbo].[Usuarios] ADD UNIQUE NONCLUSTERED 
(
	[Documento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Compras] ADD  DEFAULT (getdate()) FOR [Fecha]
GO
ALTER TABLE [dbo].[Facturas] ADD  CONSTRAINT [DF__Facturas__Fecha__4E88ABD4]  DEFAULT (getdate()) FOR [Fecha]
GO
ALTER TABLE [dbo].[InicioSesion] ADD  DEFAULT ((0)) FOR [Verificado]
GO
ALTER TABLE [dbo].[InicioSesion] ADD  DEFAULT (getdate()) FOR [FechaRegistro]
GO
ALTER TABLE [dbo].[Compras]  WITH CHECK ADD FOREIGN KEY([IdUsuarioFK])
REFERENCES [dbo].[Usuarios] ([IdUsuario])
GO
ALTER TABLE [dbo].[Compras]  WITH CHECK ADD FOREIGN KEY([TaxIdFK])
REFERENCES [dbo].[Proveedores] ([TaxId])
GO
ALTER TABLE [dbo].[DetalleCompra]  WITH CHECK ADD FOREIGN KEY([IdCompraFK])
REFERENCES [dbo].[Compras] ([IdCompra])
GO
ALTER TABLE [dbo].[DetalleFactura]  WITH CHECK ADD  CONSTRAINT [FK__DetalleFa__IdFac__5441852A] FOREIGN KEY([IdFacturaFK])
REFERENCES [dbo].[Facturas] ([IdFactura])
GO
ALTER TABLE [dbo].[DetalleFactura] CHECK CONSTRAINT [FK__DetalleFa__IdFac__5441852A]
GO
ALTER TABLE [dbo].[Facturas]  WITH CHECK ADD  CONSTRAINT [FK__Facturas__IdClie__5629CD9C] FOREIGN KEY([IdClienteFK])
REFERENCES [dbo].[Clientes] ([Documento])
GO
ALTER TABLE [dbo].[Facturas] CHECK CONSTRAINT [FK__Facturas__IdClie__5629CD9C]
GO
ALTER TABLE [dbo].[Productos]  WITH CHECK ADD  CONSTRAINT [FK_Productos_Proveedores] FOREIGN KEY([TaxIdFK])
REFERENCES [dbo].[Proveedores] ([TaxId])
GO
ALTER TABLE [dbo].[Productos] CHECK CONSTRAINT [FK_Productos_Proveedores]
GO
/****** Object:  StoredProcedure [dbo].[sp_CrearFactura]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedimiento almacenado para crear facturas
CREATE   PROCEDURE [dbo].[sp_CrearFactura]
    @DocumentoCliente BIGINT,
    @Subtotal DECIMAL(18,2),
    @Impuesto DECIMAL(18,2),
    @Total DECIMAL(18,2),
    @MetodoPago VARCHAR(50) = 'Efectivo'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Insertar la factura
        INSERT INTO dbo.Facturas (
            Fecha,
            IdClienteFK,
            Subtotal,
            Impuesto,
            Total,
            MetodoPago
        )
        VALUES (
            GETDATE(),
            @DocumentoCliente,
            @Subtotal,
            @Impuesto,
            @Total,
            @MetodoPago
        );
        
        -- Retornar el ID de la factura recién creada
        SELECT SCOPE_IDENTITY() AS IdFactura;
        
    END TRY
    BEGIN CATCH
        -- Si hay error, retornarlo
        THROW;
    END CATCH
END;
GO
/****** Object:  StoredProcedure [dbo].[spActualizarProducto]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[spActualizarProducto]
    @IdProducto INT,
  @Referencia VARCHAR(100),
  @Descripcion VARCHAR(255),
  @Talla VARCHAR(10),
  @PrecioVenta DECIMAL(10,2),
  @PrecioCompra DECIMAL(10,2),
  @IdCategoriaFK INT,
  @TaxIdFK INT
AS
BEGIN
  UPDATE Productos
  SET Referencia = @Referencia,
      Descripcion = @Descripcion,
      Talla = @Talla,
      PrecioVenta = @PrecioVenta,
      PrecioCompra = @PrecioCompra,
      IdCategoriaFK = @IdCategoriaFK,
      TaxIdFK = @TaxIdFK
  WHERE IdProducto = @IdProducto;
END;
GO
/****** Object:  StoredProcedure [dbo].[spBuscarClientePorDocumento]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedimiento para buscar cliente por documento
CREATE   PROCEDURE [dbo].[spBuscarClientePorDocumento]
    @Documento BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Documento,
        Nombre,
        Telefono,
        Correo,
        Direccion
    FROM dbo.Clientes
    WHERE Documento = @Documento;
END;
GO
/****** Object:  StoredProcedure [dbo].[spBuscarProductos]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedimiento almacenado para buscar productos por Referencia o Descripción
CREATE   PROCEDURE [dbo].[spBuscarProductos]
    @Busqueda VARCHAR(100) = ''
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Si no hay búsqueda, retornar todos los productos
    IF @Busqueda = '' OR @Busqueda IS NULL
    BEGIN
        SELECT 
            p.IdProducto,
            p.Referencia,
            p.Descripcion,
            p.Talla,
            p.PrecioVenta,
            p.PrecioCompra,
            c.NombreCategoria,
            pr.NombreEmpresa AS NombreProveedor
        FROM Productos p
        INNER JOIN Categorias c ON p.IdCategoriaFK = c.IdCategoria
        INNER JOIN Proveedores pr ON p.TaxIdFK = pr.TaxId
        ORDER BY p.IdProducto DESC;
    END
    ELSE
    BEGIN
        -- Buscar por Referencia o Descripción
        SELECT 
            p.IdProducto,
            p.Referencia,
            p.Descripcion,
            p.Talla,
            p.PrecioVenta,
            p.PrecioCompra,
            c.NombreCategoria,
            pr.NombreEmpresa AS NombreProveedor
        FROM Productos p
        INNER JOIN Categorias c ON p.IdCategoriaFK = c.IdCategoria
        INNER JOIN Proveedores pr ON p.TaxIdFK = pr.TaxId
        WHERE 
            p.Referencia LIKE '%' + @Busqueda + '%' 
            OR p.Descripcion LIKE '%' + @Busqueda + '%'
        ORDER BY p.IdProducto DESC;
    END
END;
GO
/****** Object:  StoredProcedure [dbo].[spConfirmarCodigo]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[spConfirmarCodigo]
  @Email VARCHAR(100),
  @Codigo VARCHAR(10)
AS
BEGIN
  IF EXISTS (
    SELECT 1 FROM InicioSesion
    WHERE Email = @Email AND CodigoVerificacion = @Codigo
  )
  BEGIN
    UPDATE InicioSesion
    SET Verificado = 1, CodigoVerificacion = NULL
    WHERE Email = @Email;

    SELECT 'OK' AS Resultado;
  END
  ELSE
  BEGIN
    SELECT 'ERROR' AS Resultado;
  END
END
GO
/****** Object:  StoredProcedure [dbo].[spConsultarProductoPorId]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[spConsultarProductoPorId]
    @IdProducto INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        IdProducto,
        Referencia,
        Descripcion,
        PrecioVenta,
        PrecioCompra,
        IdCategoriaFK,
        TaxIdFK
    FROM Productos
    WHERE IdProducto = @IdProducto;
END;
GO
/****** Object:  StoredProcedure [dbo].[spCrearCliente]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedimiento almacenado para crear clientes
CREATE   PROCEDURE [dbo].[spCrearCliente]
    @Documento BIGINT,
    @Nombre VARCHAR(100),
    @Telefono BIGINT,
    @Correo VARCHAR(100),
    @Direccion VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verificar si ya existe
        IF EXISTS (SELECT 1 FROM dbo.Clientes WHERE Documento = @Documento)
        BEGIN
            -- Retornar el cliente existente
            SELECT 
                Documento,
                Nombre,
                Telefono,
                Correo,
                Direccion
            FROM dbo.Clientes
            WHERE Documento = @Documento;
            RETURN;
        END

        -- Insertar el cliente
        INSERT INTO dbo.Clientes (
            Documento,
            Nombre,
            Telefono,
            Correo,
            Direccion
        )
        VALUES (
            @Documento,
            @Nombre,
            @Telefono,
            @Correo,
            @Direccion
        );
        
        -- Retornar el cliente recién creado
        SELECT 
            Documento,
            Nombre,
            Telefono,
            Correo,
            Direccion
        FROM dbo.Clientes
        WHERE Documento = @Documento;
        
    END TRY
    BEGIN CATCH
        SELECT -1 AS Documento, ERROR_MESSAGE() AS Mensaje;
    END CATCH
END;
GO
/****** Object:  StoredProcedure [dbo].[spEliminarProducto]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[spEliminarProducto]
    @IdProducto INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Productos
    WHERE IdProducto = @IdProducto;
END;
GO
/****** Object:  StoredProcedure [dbo].[spInsertarProducto]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[spInsertarProducto]
	@Referencia VARCHAR(100),
	@Descripcion VARCHAR(255),
	@Talla Varchar(10),
	@PrecioVenta DECIMAL(10,2),
	@PrecioCompra DECIMAL(10,2),
	@IdCategoriaFK INT,
	@TaxIdFK INT
AS
BEGIN
	SET NOCOUNT ON;

	INSERT INTO Productos(
	Referencia,
	Descripcion,
	Talla,
	PrecioVenta,
	PrecioCompra,
	IdCategoriaFK,
	TaxIdFK
	)
	VALUES (
	@Referencia,
	@Descripcion,
	@Talla,
	@PrecioVenta,
	@PrecioCompra,
	@IdCategoriaFK,
	@TaxIdFK
	);
END;
GO
/****** Object:  StoredProcedure [dbo].[spListarCategorias]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[spListarCategorias]
AS
BEGIN
    SELECT IdCategoria, NombreCategoria
    FROM Categorias;
END
GO
/****** Object:  StoredProcedure [dbo].[spListarProductos]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[spListarProductos]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.IdProducto,
        P.Referencia,
        P.Descripcion,
        P.Talla,
        P.PrecioVenta,
        P.PrecioCompra,
        P.IdCategoriaFK,
        C.NombreCategoria,
        P.TaxIdFK,
        PR.NombreEmpresa AS NombreProveedor
    FROM Productos P
    INNER JOIN Categorias C ON P.IdCategoriaFK = C.IdCategoria
    INNER JOIN Proveedores PR ON P.TaxIdFK = PR.TaxId;
END;
GO
/****** Object:  StoredProcedure [dbo].[spListarProveedor]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[spListarProveedor]
AS
BEGIN
    SELECT TaxId, NombreEmpresa
    FROM Proveedores;
END
GO
/****** Object:  StoredProcedure [dbo].[spLoginUsuario]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[spLoginUsuario]
    @Email NVARCHAR(100),
    @Contrasena NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- Busca el usuario que tenga ese email y contraseña
    SELECT 
        IdUsuario,
        Nombre,
        Email,
        Verificado
    FROM InicioSesion
    WHERE Email = @Email
      AND Password = @Contrasena;
END
GO
/****** Object:  StoredProcedure [dbo].[spObtenerUltimasFacturas]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedimiento almacenado para obtener las últimas facturas
CREATE   PROCEDURE [dbo].[spObtenerUltimasFacturas]
    @Cantidad INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Cantidad)
        f.IdFactura,
        f.Fecha,
        f.Total,
        f.Subtotal,
        f.Impuesto,
        f.MetodoPago,
        c.Nombre AS NombreCliente,
        c.Documento
    FROM Facturas f
    INNER JOIN Clientes c ON f.IdClienteFK = c.Documento
    ORDER BY f.Fecha DESC, f.IdFactura DESC;
END;
GO
/****** Object:  StoredProcedure [dbo].[spObtenerVentasMensuales]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedimiento almacenado para obtener ventas diarias del mes actual
CREATE   PROCEDURE [dbo].[spObtenerVentasMensuales]
    @Anio INT = NULL,
    @Mes INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Si no se especifica año y mes, usar el mes actual
    IF @Anio IS NULL
        SET @Anio = YEAR(GETDATE());
    
    IF @Mes IS NULL
        SET @Mes = MONTH(GETDATE());
    
    -- Obtener ventas agrupadas por día del mes
    SELECT 
        DAY(Fecha) AS Dia,
        COUNT(*) AS CantidadFacturas,
        SUM(Total) AS TotalVentas
    FROM Facturas
    WHERE YEAR(Fecha) = @Anio 
        AND MONTH(Fecha) = @Mes
    GROUP BY DAY(Fecha)
    ORDER BY DAY(Fecha);
END;
GO
/****** Object:  StoredProcedure [dbo].[spRegistrarUsuario]    Script Date: 11/15/2025 10:10:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[spRegistrarUsuario]
  @Nombre VARCHAR(100),
  @Email VARCHAR(100),
  @Password VARCHAR(255),
  @Codigo VARCHAR(10)
AS
BEGIN
  IF EXISTS (SELECT 1 FROM InicioSesion WHERE Email = @Email)
  BEGIN
    SELECT 'EXISTE' AS Resultado;
    RETURN;
  END

  INSERT INTO InicioSesion (Nombre, Email, Password, CodigoVerificacion, Verificado)
  VALUES (@Nombre, @Email, @Password, @Codigo, 0);

  SELECT 'PENDIENTE' AS Resultado;
END
GO
