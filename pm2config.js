module.exports = {
  apps : [
      {
        name: "IAM-API",
        script: "./index.js",
        watch: true,
        instance_var: 'IAMAPI',
        env: {
            "NODE_ENV": "production"
        }
      }
  ]
}
