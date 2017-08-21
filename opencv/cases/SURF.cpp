﻿//SURF.cpp

#include <opencv2/core/core.hpp>  
#include <opencv2/highgui/highgui.hpp>  
#include <opencv2/imgproc/imgproc.hpp>  
#include <opencv2/features2d/features2d.hpp>
#include <opencv2/nonfree/nonfree.hpp>
#include <iostream>  

using namespace std;
using namespace cv;

static void ShowHelpText();//输出帮助文字  

int main(int argc, char** argv)
{

	//【0】显示帮助文字    
	ShowHelpText();

	//【1】载入源图片并显示  
	Mat srcImage1 = imread("1.jpg", 1);
	Mat srcImage2 = imread("2.jpg", 1);
	if (!srcImage1.data || !srcImage2.data)//检测是否读取成功  
	{
		printf("读取图片错误，请确定目录下是否有imread函数指定名称的图片存在~！ \n"); return false;
	}
	imshow("原始图1", srcImage1);
	imshow("原始图2", srcImage2);

	//【2】定义需要用到的变量和类  
	int minHessian = 400;//定义SURF中的hessian阈值特征点检测算子  
	SurfFeatureDetector detector(minHessian);//定义一个SurfFeatureDetector（SURF） 特征检测类对象  
	std::vector<KeyPoint> keypoints_1, keypoints_2;//vector模板类是能够存放任意类型的动态数组，能够增加和压缩数据  

												   //【3】调用detect函数检测出SURF特征关键点，保存在vector容器中  
	detector.detect(srcImage1, keypoints_1);
	detector.detect(srcImage2, keypoints_2);

	//【4】绘制特征关键点  
	Mat img_keypoints_1; Mat img_keypoints_2;
	drawKeypoints(srcImage1, keypoints_1, img_keypoints_1, Scalar::all(-1), DrawMatchesFlags::DEFAULT);
	drawKeypoints(srcImage2, keypoints_2, img_keypoints_2, Scalar::all(-1), DrawMatchesFlags::DEFAULT);

	//【5】显示效果图  
	imshow("特征点检测效果图1", img_keypoints_1);
	imshow("特征点检测效果图2", img_keypoints_2);

	waitKey(0);
	return 0;
}


//-----------------------------------【ShowHelpText( )函数】----------------------------------  
//          描述：输出一些帮助信息  
//----------------------------------------------------------------------------------------------  
void ShowHelpText()
{
	//输出一些帮助信息    
	printf("\n\n\n\t欢迎来到【SURF特征点检测】示例程序~\n\n");
	printf("\n\n\t按键操作说明: \n\n"
		"\t\t键盘按键任意键- 退出程序\n\n"
		"\n\n\t\t\t\t\t referred from 浅墨\n\n\n");

}