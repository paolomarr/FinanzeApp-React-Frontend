import { defineConfig } from 'vite'                                                                                                                                                              
import react from '@vitejs/plugin-react'                                                                                                                                                         
import { lingui } from '@lingui/vite-plugin'                                                                                                                                                     
                                                                                                                                                                                                 
export default defineConfig({                                                                                                                                                                    
  plugins: [                                                                                                                                                                                     
    react({                                                                                                                                                                                      
      babel: {                                                                                                                                                                                   
        plugins: ['macros']                                                                                                                                                                      
      }                                                                                                                                                                                          
    }),                                                                                                                                                                                          
    lingui()                                                                                                                                                                                     
  ],                                                                                                                                                                                             
  server: {                                                                                                                                                                                      
    port: 3000                                                                                                                                                                                   
  },                                                                                                                                                                                             
  css: {                                                                                                                                                                                         
    preprocessorOptions: {                                                                                                                                                                       
      scss: {                                                                                                                                                                                    
        includePaths: ['node_modules']                                                                                                                                                           
      }                                                                                                                                                                                          
    }                                                                                                                                                                                            
  }                                                                                                                                                                                              
})import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { lingui } from '@lingui/vite-plugin'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['macros']
      }
    }),
    lingui()
  ],
  server: {
    port: 3000
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules']
      }
    }
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
})
