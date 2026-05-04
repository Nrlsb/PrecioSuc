import './globals.css';

export const metadata = {
  title: 'PrecioSuc - Lista de Precios',
  description: 'Gestión de precios y sucursales',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
