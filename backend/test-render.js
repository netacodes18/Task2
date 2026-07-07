const fs = require('fs');

async function run() {
  try {
    // 1. Upload
    console.log('Uploading...');
    const formData = new FormData();
    const blob = new Blob(['id,value\n1,100\n2,200'], { type: 'text/csv' });
    formData.append('file', blob, 'test.csv');
    
    let res = await fetch('https://task2-se5w.onrender.com/api/upload', {
      method: 'POST',
      body: formData,
      headers: { 'x-session-id': 'agent-test-123' }
    });
    let data = await res.json();
    console.log('Upload res:', data);

    // 2. Confirm
    console.log('Confirming...');
    let confRes = await fetch('https://task2-se5w.onrender.com/api/upload/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': 'agent-test-123' },
      body: JSON.stringify({ originalName: 'test.csv', schema: data.schema, filePath: data.filePath, datasetName: 'Test Set' })
    });
    let confData = await confRes.json();
    console.log('Confirm res:', confData);

    // 3. Get Dashboard
    const id = confData.dataset.id;
    console.log('Fetching dashboard for', id);
    let dashRes = await fetch('https://task2-se5w.onrender.com/api/dashboard/' + id, {
      headers: { 'x-session-id': 'agent-test-123' }
    });
    
    if (dashRes.ok) {
      console.log('Dashboard Data:', await dashRes.json());
    } else {
      console.log('Dashboard Error Status:', dashRes.status);
      console.log('Dashboard Error Text:', await dashRes.text());
    }

  } catch (err) {
    console.error('Script Error:', err);
  }
}

run();
