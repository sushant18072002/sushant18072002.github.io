const fetch = require('node-fetch');

async function testHotelsAPI() {
  try {
    console.log('🧪 Testing Hotels API...');
    
    // Test 1: Search hotels
    const searchResponse = await fetch('http://localhost:3000/api/hotels?destination=Paris&priceRange=luxury');
    const searchData = await searchResponse.json();
    
    console.log('📊 Search Results:', {
      success: searchData.success,
      hotelCount: searchData.data?.hotels?.length || 0,
      firstHotelId: searchData.data?.hotels?.[0]?._id,
      hasRealIds: searchData.data?.hotels?.every(h => h._id && !h._id.startsWith('sample'))
    });
    
    // Test 2: Get hotel details (if any hotels exist)
    if (searchData.data?.hotels?.length > 0) {
      const hotelId = searchData.data.hotels[0]._id;
      console.log('🔍 Testing hotel details for ID:', hotelId);
      
      const detailResponse = await fetch(`http://localhost:3000/api/hotels/${hotelId}`);
      const detailData = await detailResponse.json();
      
      console.log('📋 Detail Results:', {
        success: detailData.success,
        hotelName: detailData.data?.hotel?.name,
        hasValidId: !hotelId.startsWith('sample')
      });
    }
    
    // Test 3: Create sample hotels
    console.log('🏗️ Creating sample hotels...');
    const createResponse = await fetch('http://localhost:3000/api/hotels/create-samples', {
      method: 'POST'
    });
    const createData = await createResponse.json();
    
    console.log('✨ Sample Creation:', {
      success: createData.success,
      message: createData.message
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHotelsAPI();