import axios from "axios";

const ChatService = {
  // getData: async () => {
  //   // let result: any[] = [];
  //   const headers = {
  //     'Content-Type': 'application/json'
  //   };
  //   await axios.get('http://127.0.0.1:4545/', { headers, timeout: 5000 })
  //     .then((res) => {
  //       // result = res.data || [];
  //       console.log(res);
  //     }).catch(error => {
  //       console.log(error);
  //     });
  //   // return result;
  // },
  sendPrompt: async (data: string) => {
    let result: any = null;
    const headers = {
      'Content-Type': 'application/json'
    };
    await axios.post(`${process.env.REACT_APP_DATA_API}/chat`, data, { headers, timeout: 10000 })
      .then((res) => {
        result = res.data || null;
        // console.log(res);
      }).catch(error => {
        if (error.code === 'ECONNABORTED') {
          result = { message: 'Request timeout. Please try again later.' };
        }
        console.log(error);
      });
    return result;
  },
}

export default ChatService;