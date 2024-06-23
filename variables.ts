export const Variables = {
	region: "ap-southeast-3",
	availabilityZones: ["ap-southeast-3", "ap-southeast-1"],
	vpcName: "AHT Kot Demo VPC",
	vpcSource: "terraform-aws-modules/vpc/aws",
	cidrBlock: "10.0.0.0/16",
	publicSubnetIps: ["10.0.1.0/24", "10.0.2.0/24"],
	privateSubnetIps: ["10.0.10.0/24", "10.0.20.0/24"],
	enableNatGateway: true,
	enableVpnGateway: false,
}