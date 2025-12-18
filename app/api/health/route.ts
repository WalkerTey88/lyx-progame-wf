export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'walter-farm-payment',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    codespace: 'codespaces-1d45cc'
  })
}
