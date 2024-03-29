import React from 'react'

import Layout from '../components/Layout'
import siteConfig from '../site.config'

const AudioList = () => (
  <Layout title={`My Audio | ${siteConfig.siteName}`}>
    <h1 className='text-2xl font-semibold text-gray-900'>MyAudio</h1>
    <p>This is the list page for Audio</p>
  </Layout>
)

export default AudioList
